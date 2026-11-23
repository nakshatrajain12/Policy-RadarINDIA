/**
 * Shared Currency & Metric Formatters for Policy Radar India Frontend
 */

export function formatINR(amount: number | null | undefined): string {
  if (amount == null) return "Amount not specified";
  const val = Number(amount);
  if (isNaN(val) || val <= 0) return "Amount not specified";

  if (val >= 10000000) {
    const cr = val / 10000000;
    const str = cr.toFixed(2).replace(/\.?0+$/, "");
    return `₹${str} Cr`;
  }
  if (val >= 100000) {
    const lakh = val / 100000;
    const str = lakh.toFixed(2).replace(/\.?0+$/, "");
    return `₹${str} Lakhs`;
  }
  return `₹${Math.round(val).toLocaleString("en-IN")}`;
}
