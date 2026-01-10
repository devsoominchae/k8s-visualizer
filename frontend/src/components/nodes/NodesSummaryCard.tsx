// src/components/nodes_temp/NodesTempSummaryCard.tsx

import { Card, Flex, Text, Progress, Box, Button, Badge, Dialog, Tooltip } from "@radix-ui/themes";
import { useRef } from "react";
import NodeTempDescribeSections from "./NodesDescribe";

import rhelLogo from "../../assets/rhel.png";
import ubuntuLogo from "../../assets/ubuntu.png";
import amazonLogo from "../../assets/amazon_linux.png";
import vmwareLogo from "../../assets/vmware_photon.png";
import defaultLogo from "../../assets/default.png";


// Map the filename from the backend string to the imported local asset
const LOGO_MAP: Record<string, string> = {
  "rhel.png": rhelLogo,
  "ubuntu.png": ubuntuLogo,
  "amazon_linux.png": amazonLogo,
  "vmware_photon.png": vmwareLogo,
  "default.png": defaultLogo,
};

// 1. Define the shape of the data coming from fetchNodeStatus
interface NodeDetails {
  ip: string;
  workload_class: string;
  os_image: string;
  os_image_logo: string;
  allocatable_pods: string;
  cpu_capacity: string;
  memory_capacity_gi: string;
  resources: {
    non_terminated_pods: string;
    cpu_requests_pct: string;
    memory_requests_pct: string;
  };
  status: { [key: string]: string | undefined };
}


interface NodeCardProps {
  nodeName: string;
  details: NodeDetails;
  describeMap: Record<string, Record<string, string>>;
}

const getStatusColor = (pct: number) => {
  if (pct >= 100) return "red";
  if (pct >= 90) return "orange";
  if (pct >= 70) return "amber";
  return "blue";
};


const getNodeStatusColor = (status: string) => {
  const s = status.toLowerCase();
  if (s === "running" || s === "ready" || s === "active" || s === "online") return "var(--green-9)";
  if (s === "pending" || s === "waiting" || s === "starting") return "var(--orange-9)";
  if (s === "error" || s === "failed" || s === "crashloopbackoff" || s === "offline") return "var(--red-9)";
  return "var(--gray-8)";
};

// ... imports and helper functions (LOGO_MAP, getStatusColor, getNodeStatusColor) remain the same

export function NodesSummaryCard({
  nodeName,
  details,
  describeMap   // Added back
}: NodeCardProps) {
  const parsePct = (val: string) => parseInt(val.replace("%", "")) || 0;

  // Logic for status
  const statusValue = details.status?.STATUS || details.status?.status || "Unknown";

  // Usage percentages
  const podUsage = (parseInt(details.resources.non_terminated_pods) / parseInt(details.allocatable_pods)) * 100;
  const cpuPct = parsePct(details.resources.cpu_requests_pct);
  const memPct = parsePct(details.resources.memory_requests_pct);

  const logoFilename = details.os_image_logo.split('/').pop() || "";
  const logoSrc = LOGO_MAP[logoFilename] || defaultLogo;

  return (
    <Card size="1" style={{ padding: 0, overflow: 'hidden' }}>
      <Flex align="stretch">

        {/* INDICATOR STRIPE */}
        <Box
          style={{
            width: '6px',
            backgroundColor: getNodeStatusColor(statusValue),
            flexShrink: 0
          }}
        />

        {/* MAIN DATA ROW */}
        <Flex gap="4" align="center" style={{ flexGrow: 1 }} py="2" pr="3">

          {/* 1. Icon & Name Section */}
          <Flex gap="3" align="center" px="3" style={{ width: "30%", minWidth: "220px" }}>
            <Tooltip content={details.os_image}>
              <Box
                style={{
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--gray-2)',
                  borderRadius: '6px',
                  border: '1px solid var(--gray-5)',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                <img
                  src={logoSrc}
                  alt="OS Logo"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }}
                />
              </Box>
            </Tooltip>
            <Box>
              <Text size="2" weight="bold" style={{ wordBreak: "break-all", display: 'block' }}>
                {nodeName}
              </Text>
              <Text size="1" color="gray">
                {details.ip}
              </Text>
            </Box>
          </Flex>

          {/* 2. Workload Class */}
          <Box style={{ width: "12%", borderLeft: "1px solid var(--gray-4)", paddingLeft: "16px" }}>
            <Text size="1" color="gray" mb="1" style={{ display: 'block', fontSize: '10px' }}>CLASS</Text>
            <Text size="2" weight="bold">{details.workload_class}</Text>
          </Box>

          {/* 3. Resources (Progress Bars) */}
          <Flex gap="4" style={{ flexGrow: 1, borderLeft: "1px solid var(--gray-4)", paddingLeft: "16px" }}>
            <Box style={{ flex: 1 }}>
              <Text as="div" size="1" mb="1" color="gray">Pods {details.resources.non_terminated_pods}/{details.allocatable_pods}</Text>
              <Progress value={podUsage} size="1" color={getStatusColor(podUsage)} style={{ height: '6px' }} />
            </Box>
            <Box style={{ flex: 1 }}>
              <Text as="div" size="1" mb="1" color="gray">{details.cpu_capacity} CPU ({cpuPct}%)</Text>
              <Progress value={cpuPct} size="1" color={getStatusColor(cpuPct)} style={{ height: '6px' }} />
            </Box>
            <Box style={{ flex: 1 }}>
              <Text as="div" size="1" mb="1" color="gray">{details.memory_capacity_gi} Mem ({memPct}%)</Text>
              <Progress value={memPct} size="1" color={getStatusColor(memPct)} style={{ height: '6px' }} />
            </Box>
          </Flex>

          {/* 4. Action Button */}
          <Flex align="center" pl="3" style={{ borderLeft: "1px solid var(--gray-4)" }}>
            <Dialog.Root>
              <Dialog.Trigger>
                <Button variant="ghost" size="1" color="gray" style={{ cursor: 'pointer' }}>
                  Describe
                </Button>
              </Dialog.Trigger>

              <Dialog.Content style={{ maxWidth: "70vw", width: "95vw" }}>
                <Dialog.Title size="3">Nodes</Dialog.Title>
                <Box id={`scroll-root-${nodeName}`}>
                  <NodeTempDescribeSections
                    nodeName={nodeName}           // Ensure this prop name matches NodeDescribeSections
                    describeMap={describeMap}
                  />
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