// src/pods/pods_temp/PodsSummaryCard.tsx

import { useState } from "react";
import { Card, Flex, Text, Box, Button, Dialog, Select } from "@radix-ui/themes";
import PodDescribeSections from "./PodsDescribe";
import PodLog from "./PodLog";
import { fetchPodContainerLog } from "../../api/pods";

export interface LogEntry {
  level: string;
  timeStamp: string;
  message: string;
  source?: string;
  [key: string]: any;
}

interface PodsCardProps {
  fileName: string;
  component: string;
  podName: string;
  containerName: string;
  details: Record<string, string>;
  visibleColumns: string[];
  describeMap: Record<string, Record<string, string>>;
  podContainerMap: Record<string, string[]>;
}

export function PodsSummaryCard({
  fileName,
  component,
  podName,
  containerName: initialContainerName, // Rename prop to avoid confusion
  details,
  visibleColumns,
  describeMap,
  podContainerMap
}: PodsCardProps) {
  const [selectedLogs, setSelectedLogs] = useState<LogEntry[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);

  // FIX 1: Track the container that was actually clicked/selected
  const [activeContainer, setActiveContainer] = useState<string>("");

  const statusValue = details["STATUS"] || details["status"] || "Unknown";
  const podContainers = podContainerMap[podName] || [];

  const handleContainerChange = async (cName: string) => {
    setIsLoading(true);
    setActiveContainer(cName); // Update the label state
    try {
      const logs = await fetchPodContainerLog(fileName, podName, cName);
      setSelectedLogs(logs);
      setIsLogDialogOpen(true);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
      setSelectedLogs([]);
      setIsLogDialogOpen(true); // Open anyway to show "No log data"
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (["running", "ready", "active", "completed"].includes(s)) return "var(--green-9)";
    if (["pending", "waiting", "starting"].includes(s)) return "var(--orange-9)";
    if (["error", "failed", "crashloopbackoff", "offline"].includes(s)) return "var(--red-9)";
    return "var(--gray-8)";
  };

  return (
    <Card size="1" style={{ padding: 0, overflow: 'hidden' }}>
      <Flex align="stretch">
        <Box style={{ width: '6px', backgroundColor: getStatusColor(statusValue), flexShrink: 0 }} />

        <Flex align="center" style={{ flexGrow: 1 }} py="2">
          {/* ... NAME and DYNAMIC COLUMNS remain the same ... */}
          <Box px="3" style={{ flex: '2', minWidth: '200px' }}>
            <Text size="1" color="gray" mb="1" style={{ display: 'block', fontSize: '10px', fontWeight: 'bold' }}>NAME</Text>
            <Text size="2" weight="bold" style={{ wordBreak: 'break-all' }}>{podName}</Text>
          </Box>

          {visibleColumns.map((key) => (
            details[key] ? (
              <Box key={key} px="3" style={{ flex: '1', borderLeft: '1px solid var(--gray-4)', minWidth: '10px' }}>
                <Text size="1" color="gray" mb="1" style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>{key}</Text>
                <Text size="2" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{details[key]}</Text>
              </Box>
            ) : null
          ))}

          {/* DESCRIBE DIALOG */}
          <Flex px="3" align="center" style={{ borderLeft: '1px solid var(--gray-4)', minWidth: '10px' }}>
            <Dialog.Root>
              <Dialog.Trigger>
                <Button variant="ghost" size="1" color="gray" style={{ width: 'max-content', cursor: 'pointer' }}>Describe</Button>
              </Dialog.Trigger>
              <Dialog.Content style={{ maxWidth: "70vw", width: "95vw" }}>
                <Dialog.Title size="3">Pod Describe: {podName}</Dialog.Title>
                <PodDescribeSections fileName={fileName} component={component} podName={podName} describeMap={describeMap} />
                <Flex gap="3" mt="4" justify="end">
                  <Dialog.Close><Button variant="soft" color="gray">Close</Button></Dialog.Close>
                </Flex>
              </Dialog.Content>
            </Dialog.Root>
          </Flex>

          {/* ACTIONS SECTION */}
          <Flex px="3" align="center" gap="3" style={{ borderLeft: '1px solid var(--gray-4)' }}>

            {/* SELECT CONTAINER */}
            <Select.Root
              // 1. Force the internal value to empty so it never "switches" to the container name
              value="Logs"
              onValueChange={handleContainerChange}
              disabled={isLoading}
            >
              <Select.Trigger
                variant="soft"
                style={{ cursor: 'pointer', width: 'max-content' }}
              >
                <Flex align="center" gap="2">
                  {/* 2. Manual text ensures it stays "Logs" or shows "Loading..." */}
                  <Text>{isLoading ? ". . . . ." : "Logs"}</Text>
                </Flex>
              </Select.Trigger>

              <Select.Content position="popper">
                {podContainers.map((container, idx) => (
                  <Select.Item key={`${podName}-${idx}`} value={container}>
                    {container}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>

            {/* CONTROLLED LOG DIALOG */}
            <Dialog.Root
              open={isLogDialogOpen}
              onOpenChange={(open) => {
                setIsLogDialogOpen(open);
                if (!open) {
                  setSelectedLogs(null);
                  setActiveContainer(""); // Reset container on close
                }
              }}
            >
              <Dialog.Content style={{ maxWidth: "90vw", width: "1200px" }}>
                {/* FIX 2: Use activeContainer state so the title matches the data */}
                <Dialog.Title>
                  Logs: <Text color="blue">{podName}</Text>
                  {activeContainer && <Text color="gray"> › {activeContainer}</Text>}
                </Dialog.Title>

                <Box mt="2" style={{ border: '1px solid var(--gray-4)', borderRadius: '4px' }}>
                  {/* FIX 3: Add a fallback for the logs prop to prevent PodLog crashes */}
                  <PodLog logs={selectedLogs || []} />
                </Box>

                <Flex gap="3" mt="4" justify="end">
                  <Dialog.Close>
                    <Button variant="soft" color="gray">Close</Button>
                  </Dialog.Close>
                </Flex>
              </Dialog.Content>
            </Dialog.Root>

          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
}