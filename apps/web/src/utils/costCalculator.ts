import { UsageData, Pill, CostBreakdown } from "../types";

export function calculateCosts(
  data: UsageData[],
  pills: Pill[]
): { breakdown: CostBreakdown[]; total: number } {
  const quantitiesByPill: Record<string, number[]> = {};
  data.forEach((d) => {
    if (!quantitiesByPill[d.pill_name]) {
      quantitiesByPill[d.pill_name] = [];
    }
    quantitiesByPill[d.pill_name].push(d.quantity);
  });

  const breakdown: CostBreakdown[] = [];
  let total = 0;

  Object.entries(quantitiesByPill).forEach(([pillName, quantities]) => {
    const pill = pills.find((p) => p.name === pillName);
    if (pill) {
      const totalQuantity = quantities.reduce((sum, q) => sum + q, 0);
      const cost = totalQuantity * pill.price;
      const average = totalQuantity / quantities.length;
      const max = Math.max(...quantities);
      const count = quantities.length;

      breakdown.push({
        pill_name: pillName,
        total_quantity: totalQuantity,
        unit_price: pill.price,
        total_cost: cost,
        average_quantity: average,
        max_quantity: max,
        usage_count: count,
      });
      total += cost;
    }
  });

  breakdown.sort((a, b) => b.total_cost - a.total_cost);
  return { breakdown, total };
}
