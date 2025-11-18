import { useState, useEffect } from "react";
import { UsageData, Pill, CostBreakdown, ViewMode } from "../types";
import { processData } from "../utils/dataProcessor";
import { calculateCosts } from "../utils/costCalculator";

export function useUsageData(
  viewMode: ViewMode,
  monthFilter: null | "current" | string,
  pills: Pill[]
) {
  const [groupedData, setGroupedData] = useState<Record<
    string,
    Record<string, number>
  > | null>(null);
  const [labels, setLabels] = useState<string[]>([]);
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown[]>([]);
  const [totalCost, setTotalCost] = useState<number>(0);

  useEffect(() => {
    const fetchUsageGraph = async () => {
      try {
        let url = "http://localhost:8000/api/v1.0/usage-graph";
        if (monthFilter === "current") {
          const thisMonth = new Date().toISOString().slice(0, 7);
          url += `?month=${thisMonth}`;
        } else if (monthFilter && monthFilter !== "current") {
          url += `?month=${monthFilter}`;
        }

        const res = await fetch(url, { credentials: "include" });
        if (!res.ok) {
          const text = await res.text();
          console.error("サーバーエラー:", res.status, text);
          throw new Error(`サーバーエラー: ${res.status}`);
        }
        const data: UsageData[] = await res.json();

        const { grouped, labels: processedLabels } = processData(
          data,
          viewMode
        );
        setGroupedData(grouped);
        setLabels(processedLabels);

        const { breakdown, total } = calculateCosts(data, pills);
        setCostBreakdown(breakdown);
        setTotalCost(total);
      } catch (err) {
        console.error("データ取得失敗:", err);
      }
    };

    if (pills.length > 0) {
      fetchUsageGraph();
    }
  }, [viewMode, monthFilter, pills]);

  return { groupedData, labels, costBreakdown, totalCost };
}
