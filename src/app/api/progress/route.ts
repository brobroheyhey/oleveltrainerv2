import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

function toSingaporeDate(date: Date) {
  const fmt = new Intl.DateTimeFormat('en-SG', {
    timeZone: 'Asia/Singapore',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  // format: mm/dd/yyyy — convert to yyyy-mm-dd
  const parts = fmt.formatToParts(date);
  const y = parts.find((p) => p.type === 'year')?.value;
  const m = parts.find((p) => p.type === 'month')?.value;
  const d = parts.find((p) => p.type === 'day')?.value;
  return `${y}-${m}-${d}`;
}

export async function GET() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const todaySG = toSingaporeDate(new Date());

  const { count: dueToday } = await supabase
    .from('card_scheduling')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .lte('due_at', todaySG);

  const { count: learningCount } = await supabase
    .from('card_scheduling')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .lt('repetition', 3);

  const { count: masteredCount } = await supabase
    .from('card_scheduling')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('repetition', 5);

  const { data: logs } = await supabase
    .from('review_logs')
    .select('reviewed_at')
    .eq('user_id', user.id)
    .order('reviewed_at', { ascending: false })
    .limit(1000);

  // Streaks: compute on the fly in SG timezone
  const days = new Set<string>();
  logs?.forEach((l) => days.add(toSingaporeDate(new Date(l.reviewed_at))));
  const today = toSingaporeDate(new Date());
  const completedToday = logs?.filter((l) => toSingaporeDate(new Date(l.reviewed_at)) === today).length ?? 0;
  const dailyGoal = 20;
  const remainingToGoal = Math.max(0, dailyGoal - completedToday);
  let current = 0;
  let iter = new Date();
  while (days.has(toSingaporeDate(iter))) {
    current += 1;
    iter.setDate(iter.getDate() - 1);
  }

  // Best streak (scan contiguous runs)
  const allDaysSorted = Array.from(days).sort();
  let best = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const ds of allDaysSorted) {
    const dt = new Date(ds);
    if (prev && dt.getTime() - prev.getTime() === 24 * 60 * 60 * 1000) {
      run += 1;
    } else {
      run = 1;
    }
    if (run > best) best = run;
    prev = dt;
  }

  return NextResponse.json({
    dueToday: dueToday ?? 0,
    learningCount: learningCount ?? 0,
    masteredCount: masteredCount ?? 0,
    streak: { current, best },
    completedToday,
    dailyGoal,
    remainingToGoal,
  });
}


