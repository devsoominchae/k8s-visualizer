import { Box, Flex, Text } from "@radix-ui/themes";

export default function Sidebar() {
  return (
    <Box width="200px" p="4" style={{ borderRight: "1px solid var(--gray-a6)" }}>
      <Flex direction="column" gap="3">
        <Text weight="bold">Details</Text>
        <Text>Nodes</Text>
        <Text>Item 3</Text>
      </Flex>
    </Box>
  );
}
