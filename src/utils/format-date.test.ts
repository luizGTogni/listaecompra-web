import { formatDate, formatRelativeDate } from "./format-date";

// Wednesday 23 Sep 2026, 15:00 local time.
const NOW = new Date(2026, 8, 23, 15, 0, 0);
const daysAgo = (days: number, hour = 9) =>
  new Date(2026, 8, 23 - days, hour).toISOString();

describe("formatRelativeDate", () => {
  it.each([
    [0, "hoje"],
    [1, "ontem"],
    [2, "2 dias atrás"],
    [3, "3 dias atrás"],
    [6, "6 dias atrás"],
    [7, "1 semana atrás"],
    [15, "2 semanas atrás"],
    [29, "4 semanas atrás"],
    [30, "1 mês atrás"],
    [65, "2 meses atrás"],
    [364, "12 meses atrás"],
    [365, "1 ano atrás"],
    [800, "2 anos atrás"],
  ])("%i days ago is %s", (days, expected) => {
    expect(formatRelativeDate(daysAgo(days), NOW)).toBe(expected);
  });

  it("counts calendar days, not hours", () => {
    const lateYesterday = new Date(2026, 8, 22, 23, 59).toISOString();
    const justNow = new Date(2026, 8, 23, 0, 1);

    expect(formatRelativeDate(lateYesterday, justNow)).toBe("ontem");
  });

  it("treats a date in the future as today", () => {
    expect(formatRelativeDate(daysAgo(-2), NOW)).toBe("hoje");
  });
});

describe("formatDate", () => {
  it("formats a short pt-BR date", () => {
    expect(formatDate(new Date(2026, 8, 20, 12).toISOString())).toBe(
      "20 de set. de 2026",
    );
  });
});
