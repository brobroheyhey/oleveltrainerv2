import Link from 'next/link';
import { headers } from 'next/headers';

export default async function DashboardPage() {
  // SSR fetch with cookies
  const hdrs = headers();
  const host = hdrs.get('x-forwarded-host') ?? hdrs.get('host');
  const proto = hdrs.get('x-forwarded-proto') ?? 'http';
  const base = host ? `${proto}://${host}` : 'http://localhost:3000';
  const res = await fetch(`${base}/api/progress`, { cache: 'no-store' });
  const progress = res.ok ? await res.json() : null;
  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-md border p-4">
          <div className="text-sm text-muted-foreground">Current Streak</div>
          <div className="text-3xl font-bold">🔥 {progress?.streak?.current ?? 0} days</div>
        </div>
        <div className="rounded-md border p-4">
          <div className="text-sm text-muted-foreground">Best Streak</div>
          <div className="text-3xl font-bold">🏆 {progress?.streak?.best ?? 0} days</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-md border p-4">
          <div className="text-sm text-muted-foreground">Due today</div>
          <div className="text-3xl font-bold">{progress?.dueToday ?? 0}</div>
        </div>
        <div className="rounded-md border p-4">
          <div className="text-sm text-muted-foreground">Learning</div>
          <div className="text-3xl font-bold">{progress?.learningCount ?? 0}</div>
        </div>
        <div className="rounded-md border p-4">
          <div className="text-sm text-muted-foreground">Mastered</div>
          <div className="text-3xl font-bold">{progress?.masteredCount ?? 0}</div>
        </div>
      </div>
      <Link href="/decks" className="inline-flex rounded-md bg-primary px-4 py-2 text-primary-foreground">
        Continue Reviews
      </Link>
    </main>
  );
}


