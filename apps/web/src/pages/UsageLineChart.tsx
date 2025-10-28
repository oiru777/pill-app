import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Spinner,
  VStack,
  ButtonGroup,
  Button,
  Input,
} from "@chakra-ui/react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface UsageData {
  timestamp: string;
  pill_name: string;
  quantity: number;
}

// 日付フォーマット
function getDayLabel(date: Date): string {
  return date.toLocaleDateString("ja-JP");
}

// 週の開始日（月曜始まり）
function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  return d.toLocaleDateString("ja-JP");
}

// 月のラベル
function getMonthLabel(date: Date): string {
  return `${date.getFullYear()}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}`;
}

// 指定範囲内の全日を生成
function generateAllDays(startDate: Date, endDate: Date): string[] {
  const days: string[] = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    days.push(getDayLabel(new Date(current)));
    current.setDate(current.getDate() + 1);
  }
  return days;
}

// 週範囲の全ラベル生成
function generateAllWeeks(startDate: Date, endDate: Date): string[] {
  const weeks: string[] = [];
  let current = new Date(getWeekStart(startDate));
  while (current <= endDate) {
    weeks.push(getWeekStart(new Date(current)));
    current.setDate(current.getDate() + 7);
  }
  return weeks;
}

// 月範囲の全ラベル生成
function generateAllMonths(startDate: Date, endDate: Date): string[] {
  const months: string[] = [];
  const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  while (current <= endDate) {
    months.push(getMonthLabel(new Date(current)));
    current.setMonth(current.getMonth() + 1);
  }
  return months;
}

const UsageSummaryChart: React.FC = () => {
  const [groupedData, setGroupedData] = useState<Record<
    string,
    Record<string, number>
  > | null>(null);
  const [labels, setLabels] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
  const [monthFilter, setMonthFilter] = useState<null | "current" | string>(
    null
  ); // null=全件, "current"=今月, "YYYY-MM"=指定月

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
        setGroupedData(processData(data, viewMode));
      } catch (err) {
        console.error("データ取得失敗:", err);
      }
    };

    fetchUsageGraph();
  }, [viewMode, monthFilter]);

  const processData = (data: UsageData[], mode: "day" | "week" | "month") => {
    if (data.length === 0) return {};

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

    setLabels(allLabels);
    return grouped;
  };

  function getPillColor(pillName: string): string {
    switch (pillName.toLowerCase()) {
      case "ブロン":
        return "rgba(66, 153, 225, 0.6)";
      case "レスタミン":
        return "rgba(250, 176, 51, 0.6)";
      case "パブロンゴールド":
        return "rgba(245, 223, 77, 0.6)";
      case "メジコン":
        return "rgba(168, 85, 247, 0.6)";
      default:
        return "rgba(160, 160, 160, 0.6)";
    }
  }

  const datasets = groupedData
    ? Object.entries(groupedData).map(([pillName, values]) => {
        const yData = labels.map((label) => values[label] || 0);
        const color = getPillColor(pillName);
        return {
          label: pillName,
          data: yData,
          backgroundColor: color,
          borderColor: color.replace("0.6", "1"),
          borderWidth: 1,
        };
      })
    : [];

  return (
    <VStack spacing={6} align="stretch">
      {/* 全件 / 今月 / 指定月 */}
      <Box textAlign="center">
        <ButtonGroup isAttached variant="outline" colorScheme="blue" mb={3}>
          <Button
            onClick={() => setMonthFilter(null)}
            isActive={monthFilter === null}
          >
            全件
          </Button>
          <Button
            onClick={() => setMonthFilter("current")}
            isActive={monthFilter === "current"}
          >
            今月
          </Button>
        </ButtonGroup>

        <Input
          type="month"
          w="150px"
          display="inline-block"
          ml={3}
          onChange={(e) => setMonthFilter(e.target.value)}
          value={
            typeof monthFilter === "string" && monthFilter !== "current"
              ? monthFilter
              : ""
          }
        />
      </Box>

      {/* 日/週/月切替 */}
      <Box textAlign="center">
        <ButtonGroup isAttached variant="outline" colorScheme="blue" mb={3}>
          <Button
            onClick={() => setViewMode("day")}
            isActive={viewMode === "day"}
          >
            日ごと
          </Button>
          <Button
            onClick={() => setViewMode("week")}
            isActive={viewMode === "week"}
          >
            週ごと
          </Button>
          <Button
            onClick={() => setViewMode("month")}
            isActive={viewMode === "month"}
          >
            月ごと
          </Button>
        </ButtonGroup>
      </Box>

      {/* チャート */}
      <Box p={5} borderWidth="1px" borderRadius="md" bg="white" shadow="md">
        <Heading size="md" mb={3}>
          使用量グラフ
        </Heading>
        {groupedData ? (
          <Bar
            data={{ labels, datasets }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "bottom" },
                tooltip: { mode: "index", intersect: false },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: { display: true, text: "合計使用量" },
                },
                x: {
                  title: {
                    display: true,
                    text:
                      viewMode === "day"
                        ? "日付"
                        : viewMode === "week"
                        ? "週の開始日（月曜）"
                        : "年月",
                  },
                },
              },
            }}
          />
        ) : (
          <Spinner />
        )}
      </Box>
    </VStack>
  );
};

export default UsageSummaryChart;
