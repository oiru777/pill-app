import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Spinner,
  VStack,
  ButtonGroup,
  Button,
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

// ✅ 日付フォーマット
function getDayLabel(date: Date): string {
  return date.toLocaleDateString("ja-JP");
}

// ✅ 週の開始日（月曜始まり）
function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  return d.toLocaleDateString("ja-JP");
}

// ✅ 月のラベル
function getMonthLabel(date: Date): string {
  return `${date.getFullYear()}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}`;
}

// ✅ 指定範囲内の全日を生成（欠損補完用）
function generateAllDays(startDate: Date, endDate: Date): string[] {
  const days: string[] = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    days.push(getDayLabel(new Date(current)));
    current.setDate(current.getDate() + 1);
  }
  return days;
}

const UsageSummaryChart: React.FC = () => {
  const [groupedData, setGroupedData] = useState<Record<
    string,
    Record<string, number>
  > | null>(null);
  const [labels, setLabels] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");

  useEffect(() => {
    fetch("http://localhost:8000/api/v1.0/usage-graph")
      .then((res) => res.json())
      .then((data: UsageData[]) => {
        setGroupedData(processData(data, viewMode));
      });
  }, [viewMode]);

  // ✅ データ整形（日/週/月）
  const processData = (data: UsageData[], mode: "day" | "week" | "month") => {
    if (data.length === 0) return {};

    const grouped: Record<string, Record<string, number>> = {};

    // 日付範囲の最小・最大を取得
    const timestamps = data.map((d) => new Date(d.timestamp));
    const minDate = new Date(Math.min(...timestamps.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...timestamps.map((d) => d.getTime())));

    let allLabels: string[];

    if (mode === "day") {
      // ✅ 欠損日も含む全日ラベル生成
      allLabels = generateAllDays(minDate, maxDate);
    } else if (mode === "week") {
      allLabels = Array.from(
        new Set(data.map((d) => getWeekStart(new Date(d.timestamp))))
      ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    } else {
      allLabels = Array.from(
        new Set(data.map((d) => getMonthLabel(new Date(d.timestamp))))
      ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    }

    // 各薬ごとに集計
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

  if (!groupedData) return <Spinner />;

  return (
    <VStack spacing={6} align="stretch">
      <Box textAlign="center">
        <ButtonGroup isAttached variant="outline" colorScheme="blue">
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

      {Object.entries(groupedData).map(([pillName, values]) => {
        const yData = labels.map((label) => values[label] || 0);

        const chartData = {
          labels,
          datasets: [
            {
              label: `${pillName} の${
                viewMode === "day" ? "日" : viewMode === "week" ? "週" : "月"
              }ごとの使用量`,
              data: yData,
              backgroundColor: "rgba(66, 153, 225, 0.6)",
              borderColor: "rgba(66, 153, 225, 1)",
              borderWidth: 1,
            },
          ],
        };

        return (
          <Box
            key={pillName}
            p={5}
            borderWidth="1px"
            borderRadius="md"
            bg="white"
            shadow="md"
          >
            <Heading size="md" mb={3}>
              {pillName} の
              {viewMode === "day" ? "日" : viewMode === "week" ? "週" : "月"}
              ごとの使用量
            </Heading>
            <Bar
              data={chartData}
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
                          ? "日付（欠損日は0）"
                          : viewMode === "week"
                          ? "週の開始日（月曜）"
                          : "年月",
                    },
                  },
                },
              }}
            />
          </Box>
        );
      })}
    </VStack>
  );
};

export default UsageSummaryChart;
