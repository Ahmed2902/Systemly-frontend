export interface FreeInterval {
  start: string; // ISO
  end: string;
}

export function isWithinFreeIntervals(
  intervals: FreeInterval[],
  startsAt: string,
  endsAt: string,
): boolean {
  const start = new Date(startsAt).getTime();
  const end = new Date(endsAt).getTime();
  return intervals.some(
    (iv) =>
      new Date(iv.start).getTime() <= start &&
      new Date(iv.end).getTime() >= end,
  );
}
