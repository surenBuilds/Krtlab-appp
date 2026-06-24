/**
 * SM-2 Algorithm implementation for Spaced Repetition System (SRS)
 */
export function calculateSRS(
  quality: number, // 0 to 5
  prevInterval: number = 0,
  prevRepetition: number = 0,
  prevEaseFactor: number = 2.5
) {
  let interval: number;
  let repetition: number;
  let easeFactor: number;

  if (quality >= 3) {
    if (prevRepetition === 0) {
      interval = 1;
    } else if (prevRepetition === 1) {
      interval = 6;
    } else {
      interval = Math.round(prevInterval * prevEaseFactor);
    }
    repetition = prevRepetition + 1;
  } else {
    repetition = 0;
    interval = 1;
  }

  easeFactor = prevEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return {
    nextReview: nextReview.toISOString(),
    interval,
    repetitionCount: repetition,
    easeFactor
  };
}
