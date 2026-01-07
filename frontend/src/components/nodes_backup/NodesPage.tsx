import { Flex, Heading, Spinner, Text } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import {
  fetchNodeNames,
  fetchNodeDescribeSections,
} from "../../api/node";
import NodeSelector from "./NodeSelector";
import NodeSummaryCard from "./NodeSummaryCard";
import NodeDescribeSections from "./NodeDescribeSections";

type Props = {
  fileName: string;
};

export default function NodesPage({ fileName }: Props) {
  const [nodes, setNodes] = useState<string[]>([]);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNodeNames(fileName).then((names) => {
      setNodes(names);
      setActiveNode(names[0] ?? null);
      setLoading(false);
    });
  }, [fileName]);

  if (loading) {
    return (
      <Flex justify="center" align="center" height="100%">
        <Spinner />
      </Flex>
    );
  }

  if (!activeNode) {
    return <Text>No nodes found</Text>;
  }

  return (
    <Flex direction="column" gap="5">
      <Heading size="5">Nodes</Heading>

      <NodeSelector
        nodes={nodes}
        activeNode={activeNode}
        onSelect={setActiveNode}
      />

      <Flex gap="5">
        <NodeSummaryCard fileName={fileName} node={activeNode} />
        <NodeDescribeSections fileName={fileName} node={activeNode} />
      </Flex>
    </Flex>
  );
}

