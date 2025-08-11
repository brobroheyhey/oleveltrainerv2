import { addDays } from 'date-fns';

export type Sm2Input = {
  repetition: number;
  intervalDays: number;
  efactor: number;
  grade: 0 | 3 | 4 | 5;
  today?: Date;
};

export type Sm2Output = {
  nextRepetition: number;
  nextIntervalDays: number;
  nextEfactor: number;
  dueAt: Date;
};

export function applySm2({
  repetition,
  intervalDays,
  efactor,
  grade,
  today = new Date(),
}: Sm2Input): Sm2Output {
  let nextRepetition = repetition;
  let nextInterval = intervalDays;
  let nextEfactor = efactor;

  if (grade < 3) {
    nextRepetition = 0;
    nextInterval = 1;
  } else {
    nextRepetition = repetition + 1;
    if (nextRepetition === 1) {
      nextInterval = 1;
    } else if (nextRepetition === 2) {
      nextInterval = 6;
    } else {
      nextInterval = Math.round(intervalDays * efactor);
    }

    nextEfactor = efactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
    if (nextEfactor < 1.3) nextEfactor = 1.3;
  }

  const dueAt = addDays(new Date(today), nextInterval);
  return {
    nextRepetition,
    nextIntervalDays: nextInterval,
    nextEfactor,
    dueAt,
  };
}

export function mapRatingToGrade(rating: 'again' | 'hard' | 'medium' | 'easy'): 0 | 3 | 4 | 5 {
  switch (rating) {
    case 'again':
      return 0;
    case 'hard':
      return 3;
    case 'medium':
      return 4;
    case 'easy':
      return 5;
  }
}


