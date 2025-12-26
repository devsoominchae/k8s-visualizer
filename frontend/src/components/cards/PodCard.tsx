import { Heading, Text, Flex, Badge } from "@radix-ui/themes";
import Card from "./Card";

export default function PodCard() {
  return (
    <Card>
      <Flex direction="column" gap="2">
        <Heading size="3">Pods</Heading>

        <Flex justify="between">
          <Text>Running</Text>
          <Badge color="green">12</Badge>
        </Flex>

        <Flex justify="between">
          <Text>Failed</Text>
          <Badge color="red">1</Badge>
        </Flex>
      </Flex>
    </Card>
  );
}
