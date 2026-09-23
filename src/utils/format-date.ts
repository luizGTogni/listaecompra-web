// A short, locale date like "20 de set. de 2026", used anywhere a date from
// the API (an ISO string) is shown to the user.
const dateFormat = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function formatDate(isoDate: string) {
  return dateFormat.format(new Date(isoDate));
}

const DAY_MS = 24 * 60 * 60 * 1000;

// Whole calendar days between two dates, in local time: 23:59 yesterday is
// "1 day ago" at 00:01 today, even though only two minutes passed.
function daysBetween(from: Date, to: Date) {
  const start = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  return Math.round((start(to) - start(from)) / DAY_MS);
}

const plural = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many} atrás`;

// "hoje", "ontem", "3 dias atrás", "2 semanas atrás", "1 mês atrás",
// "1 ano atrás". A date in the future (a clock a bit off) counts as today.
export function formatRelativeDate(isoDate: string, now = new Date()) {
  const days = Math.max(0, daysBetween(new Date(isoDate), now));

  if (days === 0) return "hoje";
  if (days === 1) return "ontem";
  if (days < 7) return `${days} dias atrás`;
  if (days < 30) return plural(Math.floor(days / 7), "semana", "semanas");
  if (days < 365) return plural(Math.floor(days / 30), "mês", "meses");
  return plural(Math.floor(days / 365), "ano", "anos");
}
