/* eslint-env jest */
import { applySm2 } from './sm2';

describe('SM-2 algorithm', () => {
  const base = { repetition: 2, intervalDays: 6, efactor: 2.5 };
  const today = new Date('2024-01-01T00:00:00.000Z');

  it('resets on grade 0 (again)', () => {
    const out = applySm2({ ...base, grade: 0, today });
    expect(out.nextRepetition).toBe(0);
    expect(out.nextIntervalDays).toBe(1);
  });

  it('increases interval and efactor for grade 5', () => {
    const out = applySm2({ ...base, grade: 5, today });
    expect(out.nextRepetition).toBe(3);
    expect(out.nextIntervalDays).toBeGreaterThanOrEqual(15); // 6 * 2.5 = 15
    expect(out.nextEfactor).toBeGreaterThanOrEqual(2.6);
  });

  it('clamps efactor to minimum 1.3', () => {
    const out = applySm2({ repetition: 5, intervalDays: 20, efactor: 1.31, grade: 0, today });
    expect(out.nextEfactor).toBe(1.31); // not changed when grade < 3

    const out2 = applySm2({ repetition: 5, intervalDays: 20, efactor: 1.31, grade: 3, today });
    expect(out2.nextEfactor).toBeGreaterThanOrEqual(1.3);
  });
});


