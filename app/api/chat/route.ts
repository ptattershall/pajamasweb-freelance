import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import type { CoreMessage } from 'ai';
import { createClient } from '@supabase/supabase-js';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { retrieveRAGContext } from '@/lib/rag-service';
import { pricingSuggestionTool, pricingInfoTool, sendQuoteToEmailTool } from '@/lib/tools/pricing-suggestion';
import { filterContent } from '@/lib/content-filter';
import { invoiceStatusTool, invoiceDetailsTool } from '@/lib/tools/invoice-status';
import { bookingStatusTool, bookingDetailsTool } from '@/lib/tools/booking-status';
import { deliverablesTool, deliverableDetailsTool } from '@/lib/tools/deliverables';
import { milestoneStatusTool, milestoneDetailsTool } from '@/lib/tools/milestone-status';
import { chatPostBodySchema } from '@/lib/validation-schemas';

type MessagePart = { type: string; text?: string };

// Lazy initialize Supabase client
let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient(): ReturnType<typeof createClient> {
  if (!supabaseClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      throw new Error('Missing Supabase environment variables');
    }

    supabaseClient = createClient(url, key);
  }
  return supabaseClient;
}

// Lazy-init proxy; no generated DB schema, so we type as client and assert table inserts.
type SupabaseClientLike = ReturnType<typeof createClient>;
const supabase = new Proxy(
  {},
  {
    get: (_target, prop) => Reflect.get(getSupabaseClient(), prop),
  }
) as SupabaseClientLike;

type InsertPayload = Record<string, unknown>;

// Initialize rate limiter
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 messages per hour
});

export async function POST(req: Request) {
  try {
    let raw: unknown
    try {
      raw = await req.json()
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const bodyParsed = chatPostBodySchema.safeParse(raw)
    if (!bodyParsed.success) {
      return new Response(
        JSON.stringify({
          error: 'Validation failed',
          details: bodyParsed.error.flatten(),
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { messages, sessionId } = bodyParsed.data

    // Get user from auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response('Unauthorized', { status: 401 });
    }

    const token = authHeader.slice(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Check rate limit
    const { success } = await ratelimit.limit(user.id);
    if (!success) {
      return new Response('Rate limit exceeded', { status: 429 });
    }

    // Detect prompt injection
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) {
      return new Response(
        JSON.stringify({ error: 'No messages provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (typeof lastMessage.content === 'string' && detectPromptInjection(lastMessage.content)) {
      return new Response(
        JSON.stringify({ error: 'Invalid input detected' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Content moderation: filter inappropriate content, PII, spam, phishing
    if (typeof lastMessage.content === 'string') {
      const filterResult = filterContent(lastMessage.content);
      if (filterResult.filtered) {
        return new Response(
          JSON.stringify({
            error: 'Your message could not be processed.',
            details: filterResult.issues,
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Create or use existing session
    let session = sessionId;
    if (!session) {
      const insertPayload: InsertPayload = { user_id: user.id, title: 'New Chat' };
      const builder = supabase.from('chat_sessions') as unknown as {
        insert: (v: InsertPayload) => { select: () => { single: () => Promise<{ data: { id: string } | null; error: Error | null }> } };
      };
      const { data, error } = await builder.insert(insertPayload).select().single();

      if (error) throw error;
      session = data!.id;
    }

    // Retrieve RAG context for the user query
    const userQuery = typeof lastMessage.content === 'string' ? lastMessage.content : '';
    const ragContext = await retrieveRAGContext(userQuery, 5);

    // Build system prompt with RAG context
    let systemPrompt = `You are a helpful sales and customer service assistant for PajamasWeb.
You help prospects get price estimates and assist authenticated clients with their projects.
Be concise, friendly, and professional.
Always include disclaimers when providing estimates.

For authenticated clients, you have access to:
- Invoice status and payment history
- Upcoming bookings and meetings
- Project deliverables and files
- Project milestone status and timeline

Use these tools proactively when clients ask about their account, payments, meetings, project status, milestones, or timeline.`;

    if (ragContext) {
      systemPrompt += `\n\nRelevant information to help answer the user's question:\n\n${ragContext}`;
    }

    // Stream response with tools
    const result = streamText({
      model: openai('gpt-4o'),
      system: systemPrompt,
      tools: {
        // Pricing tools (for all users)
        pricingSuggestion: pricingSuggestionTool,
        pricingInfo: pricingInfoTool,
        sendQuoteToEmail: sendQuoteToEmailTool,
        // Client-specific tools (for authenticated clients)
        invoiceStatus: invoiceStatusTool,
        invoiceDetails: invoiceDetailsTool,
        bookingStatus: bookingStatusTool,
        bookingDetails: bookingDetailsTool,
        deliverables: deliverablesTool,
        deliverableDetails: deliverableDetailsTool,
        milestoneStatus: milestoneStatusTool,
        milestoneDetails: milestoneDetailsTool,
      },
      messages: messages as CoreMessage[],
    });

    // Log interaction
    const response = await result.response;
    let responseText = '';
    if (response.messages && response.messages.length > 0) {
      const lastMsg = response.messages[response.messages.length - 1];
      if (typeof lastMsg.content === 'string') {
        responseText = lastMsg.content;
      } else if (Array.isArray(lastMsg.content)) {
        responseText = lastMsg.content
          .filter((part: MessagePart) => part.type === 'text')
          .map((part: MessagePart) => part.text || '')
          .join('');
      }
    }
    const userMessageText =
      typeof lastMessage?.content === 'string' ? lastMessage.content : '';
    if (session) {
      logChatInteraction(user.id, session, userMessageText, responseText).catch(
        (err) => console.error('Failed to log chat interaction:', err)
      );
    }

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

function detectPromptInjection(input: string): boolean {
  const injectionPatterns = [
    /ignore previous instructions/i,
    /forget everything/i,
    /system prompt/i,
    /admin mode/i,
    /bypass/i,
    /execute code/i,
  ];

  return injectionPatterns.some(pattern => pattern.test(input));
}

async function logChatInteraction(
  userId: string,
  sessionId: string,
  userMessage: string | undefined,
  aiResponse: string | undefined
) {
  try {
    const insertPayload: InsertPayload = {
      user_id: userId,
      session_id: sessionId,
      user_message: userMessage || '',
      ai_response: aiResponse || '',
      timestamp: new Date().toISOString(),
    };
    await (supabase.from('chat_audit_log') as unknown as { insert: (v: InsertPayload) => unknown }).insert(insertPayload);
  } catch (error) {
    console.error('Error logging chat interaction:', error);
  }
}

