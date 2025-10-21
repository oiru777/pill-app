import React, { useEffect, useState } from "react";
import { Box, Heading, Spinner, VStack } from "@chakra-ui/react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

interface UsageData {
  timestamp: string;
  pill_name: string;
  quantity: number;
}

// ✅ 線形回帰（単回帰）を計算する関数
function calcTrendline(yValues: number[]) {
  const n = yValues.length;
  const xValues = Array.from({ length: n }, (_, i) => i + 1);

  const sumX = xValues.reduce((a, b) => a + b, 0);
  const sumY = yValues.reduce((a, b) => a + b, 0);
  const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
  const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);

  const a = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX); // 傾き
  const b = (sumY - a * sumX) / n; // 切片

  // 回帰線の予測値を生成
  return xValues.map((x) => a * x + b);
}

const UsageLineChart: React.FC = () => {
  const [groupedData, setGroupedData] = useState<Record<string, any> | null>(
    null
  );
  const [labels, setLabels] = useState<string[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/v1.0/usage-graph")
      .then((res) => res.json())
      .then((data: UsageData[]) => {
        // 📅 データ整形
        const grouped: Record<string, Record<string, number>> = {};
        data.forEach((d) => {
          const date = new Date(d.timestamp).toLocaleDateString("ja-JP");
          if (!grouped[d.pill_name]) grouped[d.pill_name] = {};
          grouped[d.pill_name][date] =
            (grouped[d.pill_name][date] || 0) + d.quantity;
        });

        const allLabels = Array.from(
          new Set(
            data.map((d) => new Date(d.timestamp).toLocaleDateString("ja-JP"))
          )
        ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

        setGroupedData(grouped);
        setLabels(allLabels);
      });
  }, []);

  if (!groupedData) return <Spinner />;

  return (
    <VStack spacing={6} align="stretch">
      {Object.entries(groupedData).map(([pillName, values]) => {
        const yData = labels.map((label) => values[label] || 0);
        const trend = calcTrendline(yData);

        const chartData = {
          labels,
          datasets: [
            {
              label: `${pillName} 使用量`,
              data: yData,
              borderColor: "rgba(66, 153, 225, 0.8)",
              backgroundColor: "rgba(66, 153, 225, 0.3)",
              fill: false,
              tension: 0.3,
            },
            {
              label: `${pillName} トレンド`,
              data: trend,
              borderColor: "rgba(237, 100, 166, 0.8)",
              borderDash: [6, 6],
              pointRadius: 0,
              fill: false,
              tension: 0,
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
              {pillName} の使用量推移
            </Heading>
            <Line
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
                    title: { display: true, text: "使用量" },
                  },
                  x: { title: { display: true, text: "日付" } },
                },
              }}
            />
          </Box>
        );
      })}
    </VStack>
  );
};

export default UsageLineChart;
