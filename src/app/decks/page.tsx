import Link from 'next/link';
import { headers } from 'next/headers';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default async function DecksPage() {
  const hdrs = headers();
  const host = hdrs.get('x-forwarded-host') ?? hdrs.get('host');
  const proto = hdrs.get('x-forwarded-proto') ?? 'http';
  const base = host ? `${proto}://${host}` : 'http://localhost:3000';
  const res = await fetch(`${base}/api/decks`, { cache: 'no-store' });
  const { decks, dueTodayByDeck } = res.ok ? await res.json() : { decks: [], dueTodayByDeck: {} };
  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold">Decks</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {decks?.map((d) => (
          <Card key={d.id}>
            <CardHeader>
              <CardTitle>{d.title}</CardTitle>
              <CardDescription>
                {d.subject} {d.topic ? `• ${d.topic}` : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link className="underline" href={`/decks/${d.id}/study`}>
                Study this deck
              </Link>
              <div className="mt-2 text-sm text-muted-foreground">Due today: {dueTodayByDeck?.[d.id] ?? 0}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}


