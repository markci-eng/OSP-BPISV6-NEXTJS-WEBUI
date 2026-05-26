export function formatApprovalDate(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";

  const text = String(value);
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!match) return text;

  const [, year, month, day] = match;
  return `${month}/${day}/${year}`;
}

export function formatApprovalDateTime(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";

  const text = String(value);
  const date = formatApprovalDate(text);
  const time = text.split(/[ T]/)[1];

  return time ? `${date} ${time}` : date;
}

export function formatPeso(value: unknown) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatNumber(value: unknown) {
  const number = Number(value ?? 0);

  if (!Number.isFinite(number)) return "-";

  return number.toLocaleString("en-PH");
}
