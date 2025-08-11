'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

type Card = {
  id: string;
  front: string;
  back: string;
  hint: string | null;
};

export default function StudyPage({ params }: { params: { id: string } }) {
  const deckId = params.id;
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [completedToday, setCompletedToday] = useState(0);
  const goal = 20;

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/cards?deckId=${deckId}&dueOnly=true`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setCards(data.cards ?? []);
      }
    };
    load();
  }, [deckId]);

  const current = useMemo(() => cards[index], [cards, index]);

  const onGrade = useCallback(
    async (rating: 'again' | 'hard' | 'medium' | 'easy') => {
      if (!current) return;
      setRevealed(false);
      await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId: current.id, grade: rating }),
      });
      setCompletedToday((c) => c + 1);
      const nextIndex = index + 1;
      if (nextIndex >= cards.length) {
        router.push('/dashboard');
      } else {
        setIndex(nextIndex);
      }
    },
    [current, index, cards.length, router],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!revealed && e.key.toLowerCase() === ' ') {
        e.preventDefault();
        setRevealed(true);
      }
      if (revealed) {
        if (e.key === '1') onGrade('again');
        if (e.key === '2') onGrade('hard');
        if (e.key === '3') onGrade('medium');
        if (e.key === '4') onGrade('easy');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [revealed, current, onGrade]);

  if (!current) {
    return <div>No due cards right now. 🎉</div>;
  }

  return (
    <main className="space-y-6">
      <div className="rounded-md border p-3 text-sm">Before you reveal, write it down or say it out loud.</div>
      <div className="rounded-md border p-6">
        <div className="text-lg font-medium">{current.front}</div>
        {current.hint ? <div className="mt-2 text-sm text-muted-foreground">Hint: {current.hint}</div> : null}
        {revealed ? (
          <div className="mt-4 rounded-md bg-muted p-4">
            <div className="text-base">{current.back}</div>
          </div>
        ) : null}
      </div>
      {!revealed ? (
        <Button aria-label="Reveal answer (Space)" onClick={() => setRevealed(true)}>
          Reveal
        </Button>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button aria-label="Again (1)" onClick={() => onGrade('again')} className="bg-red-600 text-white hover:opacity-90">
            Again
          </Button>
          <Button aria-label="Hard (2)" onClick={() => onGrade('hard')} className="bg-orange-600 text-white hover:opacity-90">
            Hard
          </Button>
          <Button aria-label="Medium (3)" onClick={() => onGrade('medium')} className="bg-yellow-600 text-white hover:opacity-90">
            Medium
          </Button>
          <Button aria-label="Easy (4)" onClick={() => onGrade('easy')} className="bg-green-600 text-white hover:opacity-90">
            Easy
          </Button>
        </div>
      )}
      <div className="text-sm text-muted-foreground">Completed today: {completedToday} / {goal}</div>
    </main>
  );
}


