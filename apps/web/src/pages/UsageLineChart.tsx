import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Spinner,
  VStack,
  ButtonGroup,
  Button,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Text,
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

interface Pill {
  id: number;
  name: string;
  price: number;
}

interface CostBreakdown {
  pill_name: string;
  total_quantity: number;
  unit_price: number;
  total_cost: number;
  average_quantity: number;
  max_quantity: number;
  usage_count: number;
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
  );
  const [pills, setPills] = useState<Pill[]>([]);
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown[]>([]);
  const [totalCost, setTotalCost] = useState<number>(0);

  // 薬剤マスタ取得
  useEffect(() => {
    const fetchPills = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1.0/pills", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("薬剤マスタ取得失敗");
        const data: Pill[] = await res.json();
        setPills(data);
      } catch (err) {
        console.error("薬剤マスタ取得エラー:", err);
      }
    };

    fetchPills();
  }, []);

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
        calculateCosts(data);
      } catch (err) {
        console.error("データ取得失敗:", err);
      }
    };

    if (pills.length > 0) {
      fetchUsageGraph();
    }
  }, [viewMode, monthFilter, pills]);

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

  const calculateCosts = (data: UsageData[]) => {
    // 薬剤ごとの使用量を配列で保持
    const quantitiesByPill: Record<string, number[]> = {};
    data.forEach((d) => {
      if (!quantitiesByPill[d.pill_name]) {
        quantitiesByPill[d.pill_name] = [];
      }
      quantitiesByPill[d.pill_name].push(d.quantity);
    });

    // 費用計算
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

    // 費用が高い順にソート
    breakdown.sort((a, b) => b.total_cost - a.total_cost);

    setCostBreakdown(breakdown);
    setTotalCost(total);
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

      {/* 使用量統計テーブル */}
      <Box p={5} borderWidth="1px" borderRadius="md" bg="white" shadow="md">
        <Heading size="md" mb={3}>
          使用量統計
        </Heading>
        {costBreakdown.length > 0 ? (
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>薬剤名</Th>
                  <Th isNumeric>合計使用回数</Th>
                  <Th isNumeric>合計使用量</Th>
                  <Th isNumeric>平均使用量</Th>
                  <Th isNumeric>最高使用量</Th>
                </Tr>
              </Thead>
              <Tbody>
                {costBreakdown.map((item) => (
                  <Tr key={item.pill_name}>
                    <Td>{item.pill_name}</Td>
                    <Td isNumeric>{item.usage_count}</Td>
                    <Td isNumeric>{item.total_quantity}</Td>
                    <Td isNumeric>{item.average_quantity.toFixed(1)}</Td>
                    <Td isNumeric>{item.max_quantity}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        ) : (
          <Text color="gray.500">データがありません</Text>
        )}
      </Box>

      {/* 費用内訳テーブル */}
      <Box p={5} borderWidth="1px" borderRadius="md" bg="white" shadow="md">
        <Heading size="md" mb={3}>
          薬にかかった費用
        </Heading>
        {costBreakdown.length > 0 ? (
          <>
            <TableContainer>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>薬剤名</Th>
                    <Th isNumeric>合計使用量</Th>
                    <Th isNumeric>単価（円）</Th>
                    <Th isNumeric>小計（円）</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {costBreakdown.map((item) => (
                    <Tr key={item.pill_name}>
                      <Td>{item.pill_name}</Td>
                      <Td isNumeric>{item.total_quantity}</Td>
                      <Td isNumeric>{item.unit_price.toLocaleString()}</Td>
                      <Td isNumeric fontWeight="bold">
                        {item.total_cost.toLocaleString()}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
            <Box mt={4} textAlign="right">
              <Text fontSize="lg" fontWeight="bold" color="blue.600">
                合計: ¥{totalCost.toLocaleString()}
              </Text>
            </Box>
          </>
        ) : (
          <Text color="gray.500">データがありません</Text>
        )}
      </Box>
    </VStack>
  );
};

export default UsageSummaryChart;
