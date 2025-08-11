import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="space-y-6">
      <h1 className="text-3xl font-bold">O-Level Trainer</h1>
      <p className="text-muted-foreground">
        Spaced repetition built for Singapore O-Level students.
      </p>
      <div className="flex gap-3">
        <Link className="underline" href="/dashboard">
          Go to Dashboard
        </Link>
        <Link className="underline" href="/decks">
          Browse Decks
        </Link>
      </div>
    </main>
  );
}


