import { openai } from '@ai-sdk/openai';
import { streamText, convertToModelMessages } from 'ai';
import { createClient } from '@supabase/supabase-js';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { retrieveRAGContext } from '@/lib/rag-service';
import { pricingSuggestionTool, pricingInfoTool } from '@/lib/tools/pricing-suggestion';
import { invoiceStatusTool, invoiceDetailsTool } from '@/lib/tools/invoice-status';
import { bookingStatusTool, bookingDetailsTool } from '@/lib/tools/booking-status';
import { deliverablesTool, deliverableDetailsTool } from '@/lib/tools/deliverables';

type ChatMessage = { role: 'user' | 'assistant'; content: string; parts?: any[] };

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

const supabase: any = new Proxy(
  {},
  {
    get: (target, prop) => {
      const client = getSupabaseClient();
      return (client as any)[prop];
    },
  }
);

// Initialize rate limiter
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 messages per hour
});

export async function POST(req: Request) {
  try {
    const { messages, sessionId } = await req.json() as {
      messages: ChatMessage[];
      sessionId?: string;
    };

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

    // Create or use existing session
    let session = sessionId;
    if (!session) {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({ user_id: user.id, title: 'New Chat' })
        .select()
        .single();

      if (error) throw error;
      session = data.id;
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

Use these tools proactively when clients ask about their account, payments, meetings, or project status.`;

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
        // Client-specific tools (for authenticated clients)
        invoiceStatus: invoiceStatusTool,
        invoiceDetails: invoiceDetailsTool,
        bookingStatus: bookingStatusTool,
        bookingDetails: bookingDetailsTool,
        deliverables: deliverablesTool,
        deliverableDetails: deliverableDetailsTool,
      },
      messages: messages as any,
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
          .filter((part: any) => part.type === 'text')
          .map((part: any) => part.text || '')
          .join('');
      }
    }
    // TODO: Log interaction (async, non-blocking)
    // Temporarily disabled due to TypeScript type narrowing issue
    // if (lastMessage && lastMessage.content) {
    //   logChatInteraction(user.id, session, lastMessage.content as string, responseText).catch(err =>
    //     console.error('Failed to log chat interaction:', err)
    //   );
    // }

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
    await supabase.from('chat_audit_log').insert({
      user_id: userId,
      session_id: sessionId,
      user_message: userMessage || '',
      ai_response: aiResponse || '',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error logging chat interaction:', error);
  }
}

