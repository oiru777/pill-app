import React from "react";
import { Box, Text, VStack, HStack, Divider, Badge } from "@chakra-ui/react";

type Pill = { id: number; name: string };
type UsageItem = { pill_id: number; quantity: number; pill: Pill };
type User = { id: number; name: string };

export type UsageList = {
  id: number;
  user_id: number;
  content: string;
  timestamp: string;
  user: User;
  items: UsageItem[];
};

interface UsageListItemProps {
  usage: UsageList;
  showUser?: boolean;
  onUsageClick?: (usageId: number) => void;
  onUserClick?: (userId: number, e: React.MouseEvent) => void;
}

function getBadgeColor(pillName: string) {
  switch (pillName.toLowerCase()) {
    case "ブロン":
      return "blue";
    case "レスタミン":
      return "orange";
    case "パブロンゴールド":
      return "yellow";
    case "メジコン":
      return "purple";
    default:
      return "gray";
  }
}

export function UsageListItem({
  usage,
  showUser = false,
  onUsageClick,
  onUserClick,
}: UsageListItemProps) {
  return (
    <Box
      p={4}
      borderWidth={1}
      borderRadius="md"
      shadow="sm"
      bg="white"
      _hover={{ bg: "gray.50", cursor: "pointer" }}
      onClick={() => onUsageClick?.(usage.id)}
    >
      <HStack justify="space-between" mb={2}>
        <Text fontWeight="bold" fontSize="lg">
          {usage.content || "無題の使用記録"}
        </Text>
        <Text fontSize="sm" color="gray.500">
          {new Date(usage.timestamp).toLocaleString("ja-JP")}
        </Text>
      </HStack>

      {showUser && (
        <HStack mb={2}>
          <Text fontSize="sm" color="gray.600">
            記録者:
          </Text>
          <Text
            fontSize="sm"
            fontWeight="bold"
            color="teal.600"
            cursor="pointer"
            _hover={{ textDecoration: "underline" }}
            onClick={(e) => onUserClick?.(usage.user.id, e)}
          >
            {usage.user?.name ?? "不明"}
          </Text>
        </HStack>
      )}

      <Divider mb={3} />

      <VStack align="start" spacing={1}>
        {usage.items.map((item) => (
          <HStack key={item.pill_id} spacing={4}>
            <Badge colorScheme={getBadgeColor(item.pill.name)}>
              {item.pill.name}
            </Badge>
            <Text>数量: {item.quantity}</Text>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
}
