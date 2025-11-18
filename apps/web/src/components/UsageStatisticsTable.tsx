import React from "react";
import {
  Box,
  Heading,
  Text,
  TableContainer,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import { CostBreakdown } from "../types";

interface UsageStatisticsTableProps {
  costBreakdown: CostBreakdown[];
}

export const UsageStatisticsTable: React.FC<UsageStatisticsTableProps> = ({
  costBreakdown,
}) => {
  return (
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
  );
};
