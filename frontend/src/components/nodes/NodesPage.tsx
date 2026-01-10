// src/components/nodes_temp/NodesPage.tsx

import { Flex, Heading, Spinner, Text } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { fetchNodeStatus, fetchNodeDescribe } from "../../api/node";
import { NodesSummaryCard } from "./NodesSummaryCard";
import ErrorBoundary from "../../common/ErrorBoundary";

type Props = {
  fileName: string;
};

export default function NodesPage({ fileName }: Props) {
  const [nodeStatusMap, setNodeStatusMap] = useState<Record<string, any>>({});
  const [describeMap, setDescribeMap] = useState<Record<string, any>>({});

  const [loadingStatus, setLoadingStatus] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoadingStatus(true);
    // Reset maps when fileName or component changes to prevent showing old data
    setNodeStatusMap({});
    setDescribeMap({});

    const loadStatus = async () => {
      try {
        const status = await fetchNodeStatus(fileName);
        if (isMounted) {
          setNodeStatusMap(status || {});
          setLoadingStatus(false); // Render the list now!

          // --- PHASE 2: Background Fetch (Only if status exists) ---
          if (status && Object.keys(status).length > 0) {
            loadBackgroundDetails();
          }
        }
      } catch (err) {
        console.error(`Failed to fetch node status:`, err);
        if (isMounted) setLoadingStatus(false);
      }
    };

    const loadBackgroundDetails = async () => {
      if (!isMounted) return;
      setLoadingDetails(true);
      try {
        const [describe] = await Promise.all([
          fetchNodeDescribe(fileName),
        ]);
        if (isMounted) {
          setDescribeMap(describe || {});
        }
      } catch (err) {
        console.error(`Background hydration failed:`, err);
      } finally {
        if (isMounted) setLoadingDetails(false);
      }
    };

    loadStatus();
    return () => { isMounted = false; };
  }, [fileName]);

  if (loadingStatus) return <Flex justify="center" p="9"><Spinner size="3" /></Flex>;

  // Convert object entries to an array for mapping
  const nodeEntries = Object.entries(nodeStatusMap);

  return (
    <Flex direction="column" gap="4" p="4">
      <Flex align="center" gap="3">
        <Heading size="5" mb="2">Nodes Overview</Heading>
        {loadingDetails && (
          <Flex align="center" gap="2">
            <Spinner size="1" />
            <Text size="1" color="gray">Loading descibe...</Text>
          </Flex>
        )}
      </Flex>

      {nodeEntries.length > 0 ? (
        nodeEntries.map(([nodeName, details]) => (
          // Wrap each card in its own boundary
          <ErrorBoundary key={nodeName}>
            <NodesSummaryCard
              nodeName={nodeName}
              details={details}
              describeMap={describeMap}
            />
          </ErrorBoundary>
        ))
      ) : (
        <Flex align="center" justify="center" p="8">
          <Text color="gray">No node data available.</Text>
        </Flex>
      )}
    </Flex>
  );
}