import React from "react";
import { Box, Heading, Spinner } from "@chakra-ui/react";
import { Bar } from "react-chartjs-2";
import { ViewMode } from "../types";
import { getPillColor } from "../utils/colorUtils";

interface UsageChartProps {
  groupedData: Record<string, Record<string, number>> | null;
  labels: string[];
  viewMode: ViewMode;
}

export const UsageChart: React.FC<UsageChartProps> = ({
  groupedData,
  labels,
  viewMode,
}) => {
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
  );
};
