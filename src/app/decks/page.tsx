import Link from 'next/link';
import { getBaseUrl } from '@/lib/absolute-url';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default async function DecksPage() {
  const base = getBaseUrl();
  type Deck = {
    id: string;
    title: string;
    subject: string | null;
    topic: string | null;
    description: string | null;
  };
  const res = await fetch(`${base}/api/decks`, { cache: 'no-store' });
  const json = (res.ok ? await res.json() : { decks: [], dueTodayByDeck: {} }) as {
    decks: Deck[];
    dueTodayByDeck: Record<string, number>;
  };
  const decks: Deck[] = json.decks ?? [];
  const dueTodayByDeck: Record<string, number> = json.dueTodayByDeck ?? {};
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


