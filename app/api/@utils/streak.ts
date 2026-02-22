export function calculateStreaks(dates: Date[]) {
  const set = new Set(dates.map((d) => d.toDateString()));

  let current = 0;
  let longest = 0;

  const today = new Date();

  // current streak
  for (let i = 0; ; i++) {
    const check = new Date();
    check.setDate(today.getDate() - i);

    if (set.has(check.toDateString())) current++;
    else break;
  }

  // longest streak
  const sorted = [...set].map((d) => new Date(d)).sort((a, b) => +a - +b);

  let temp = 1;

  for (let i = 1; i < sorted.length; i++) {
    const diff =
      (sorted[i].getTime() - sorted[i - 1].getTime()) / (1000 * 60 * 60 * 24);

    if (diff === 1) {
      temp++;
      longest = Math.max(longest, temp);
    } else {
      temp = 1;
    }
  }

  return {
    current,
    longest,
  };
}
