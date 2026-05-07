import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    return NextResponse.json({ token: session.access_token }, { status: 200 });
  } catch (error) {
    console.error('Error getting auth token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

