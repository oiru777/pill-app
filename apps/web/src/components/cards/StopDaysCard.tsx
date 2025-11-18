// src/components/StopDaysCard.tsx
import type { FC } from "react";
import { Box, VStack, Text, Spinner, Badge, Button } from "@chakra-ui/react";
import type { StopPillData } from "../../types";

interface Props {
  loading: boolean;
  error: string | null;
  data: StopPillData | null;
  onRetry: () => void;
  getMilestoneColor: (days: number) => string;
  getMilestoneMessage: (days: number) => string;
}

export const StopDaysCard: FC<Props> = ({
  loading,
  error,
  data,
  onRetry,
  getMilestoneColor,
  getMilestoneMessage,
}) => {
  return (
    <Box
      borderWidth="1px"
      borderRadius="xl"
      p={6}
      bg="white"
      shadow="md"
      textAlign="center"
    >
      {loading ? (
        <Spinner size="lg" color="teal.500" />
      ) : error ? (
        <VStack spacing={2}>
          <Text color="red.500" fontSize="sm">
            取得失敗
          </Text>
          <Button size="xs" onClick={onRetry} colorScheme="teal">
            再読み込み
          </Button>
        </VStack>
      ) : data ? (
        <VStack spacing={2}>
          <Text fontSize="sm" fontWeight="medium" color="gray.600">
            断薬日数
          </Text>

          <Text fontSize="5xl" fontWeight="bold" color="teal.500">
            {data.stop_days}
          </Text>

          <Text fontSize="lg" color="gray.500">
            日
          </Text>

          {data.stop_days > 0 && (
            <Badge
              colorScheme={getMilestoneColor(data.stop_days)}
              fontSize="xs"
              px={2}
              py={1}
              borderRadius="full"
            >
              {getMilestoneMessage(data.stop_days)}
            </Badge>
          )}

          <Text fontSize="xs" color="gray.500" mt={2}>
            最高記録: {data.max_stop_days}日
          </Text>
        </VStack>
      ) : (
        <Text color="gray.500" fontSize="sm">
          データなし
        </Text>
      )}
    </Box>
  );
};
