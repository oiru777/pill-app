import { UsageData, ViewMode } from "../types";
import {
  getDayLabel,
  getWeekStart,
  getMonthLabel,
  generateAllDays,
  generateAllWeeks,
  generateAllMonths,
} from "./dateUtils";

export function processData(
  data: UsageData[],
  mode: ViewMode
): { grouped: Record<string, Record<string, number>>; labels: string[] } {
  if (data.length === 0) return { grouped: {}, labels: [] };

  const grouped: Record<string, Record<string, number>> = {};
  const timestamps = data.map((d) => new Date(d.timestamp));
  const minDate = new Date(Math.min(...timestamps.map((d) => d.getTime())));
  const maxDate = new Date(Math.max(...timestamps.map((d) => d.getTime())));

  let allLabels: string[];
  if (mode === "day") allLabels = generateAllDays(minDate, maxDate);
  else if (mode === "week") allLabels = generateAllWeeks(minDate, maxDate);
  else allLabels = generateAllMonths(minDate, maxDate);

  data.forEach((d) => {
    const date = new Date(d.timestamp);
    const key =
      mode === "day"
        ? getDayLabel(date)
        : mode === "week"
        ? getWeekStart(date)
        : getMonthLabel(date);

    if (!grouped[d.pill_name]) grouped[d.pill_name] = {};
    grouped[d.pill_name][key] = (grouped[d.pill_name][key] || 0) + d.quantity;
  });

  return { grouped, labels: allLabels };
}
