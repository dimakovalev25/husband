const bynFormatter = new Intl.NumberFormat("ru-BY", {
  maximumFractionDigits: 2,
});

export function formatBYN(value) {
  return bynFormatter.format(value);
}