// src/components/nodes_temp/NodesPage.tsx

import { Flex, Heading, Spinner, Text } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { fetchNodeStatus } from "../../api/node";
import { NodesSummaryCard } from "./NodesSummaryCard";

type Props = {
  fileName: string;
};

export default function NodesPage({ fileName }: Props) {
  const [nodeStatusMap, setNodeStatusMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchNodeStatus(fileName)
      .then((data) => {
        if (isMounted) {
          setNodeStatusMap(data || {});
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch node status:", err);
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [fileName]);

  if (loading) return <Flex justify="center" p="9"><Spinner size="3" /></Flex>;

  // Convert object entries to an array for mapping
  const nodeEntries = Object.entries(nodeStatusMap);

  return (
    <Flex direction="column" gap="4" p="4">
      <Heading size="5" mb="2">Nodes Status</Heading>

      {nodeEntries.length > 0 ? (
        nodeEntries.map(([nodeName, details]) => (
          <NodesSummaryCard
            key={nodeName}
            fileName={fileName}
            nodeName={nodeName}
            details={details}
          />
        ))
      ) : (
        <Text color="gray">No node data available.</Text>
      )}
    </Flex>
  );
}