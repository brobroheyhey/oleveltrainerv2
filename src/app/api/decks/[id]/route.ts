import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const supabase = createServerClient();
  const { data: deck, error } = await supabase.from('decks').select('*').eq('id', params.id).maybeSingle();
  if (error || !deck) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { count: totalCards } = await supabase.from('cards').select('*', { count: 'exact', head: true }).eq('deck_id', params.id);
  // Due today approximation: count of cards with due_at <= today for current user will be computed client-side per user; here return total
  return NextResponse.json({ deck, counts: { totalCards } });
}


