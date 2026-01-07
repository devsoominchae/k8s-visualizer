// src/components/nodes_temp/NodesTempSummaryCard.tsx

import { Card, Flex, Text, Progress, Box, Button, Badge, Dialog, Tooltip } from "@radix-ui/themes";
import { useRef } from "react";
import NodeTempDescribeSections from "./NodesDescribe";

import rhelLogo from "../../assets/rhel.png";
import ubuntuLogo from "../../assets/ubuntu.png";
import amazonLogo from "../../assets/amazon_linux.png";
import vmwareLogo from "../../assets/vmware_photon.png";
import defaultLogo from "../../assets/default.png";

type Props = {
  fileName: string;
  node: string;
};

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
  fileName: string;
  nodeName: string;
  details: NodeDetails;
}

const getStatusColor = (pct: number) => {
  if (pct >= 100) return "red";
  if (pct >= 90) return "orange";
  if (pct >= 70) return "amber";
  return "blue";
};

export function NodesSummaryCard({ fileName, nodeName, details }: NodeCardProps) {
  // Helper to convert "73%" string to 73 number
  const parsePct = (val: string) => parseInt(val.replace("%", "")) || 0;
  const sectionRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Calculate Pod usage percentage
  const podUsage = (parseInt(details.resources.non_terminated_pods) / parseInt(details.allocatable_pods)) * 100;
  const cpuPct = parsePct(details.resources.cpu_requests_pct);
  const memPct = parsePct(details.resources.memory_requests_pct);

  const logoFilename = details.os_image_logo.split('/').pop() || "";
  const logoSrc = LOGO_MAP[logoFilename] || defaultLogo;

  const isReady = details.status?.STATUS?.toLowerCase() === "ready";

  function scrollToSection(index: number) {
    const el = sectionRefs.current[index];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <Card size="2">
      <Flex gap="4" align="center">
        {/* 1. Icon & Name */}
        <Flex gap="3" align="center" style={{ width: "35%" }}>
          <Tooltip content={details.os_image}>
            <Box
              style={{
                width: '44px',   // Matches the height of two lines of text (Name + IP)
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--gray-2)', // Light background for logos with transparency
                borderRadius: '6px',             // Subtle rounding (Radius 2 in Radix)
                border: '1px solid var(--gray-5)',
                overflow: 'hidden',
                flexShrink: 0,                   // Prevents the box from squishing
              }}
            >
              <img
                src={logoSrc}
                alt="OS Logo"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain', // Important: maintains square ratio without cropping
                  padding: '4px'        // Prevents the logo from touching the edges
                }}
              />
            </Box>
          </Tooltip>
          <Box>
            {/* Wrap Name and Badge in a horizontal Flex */}
            <Flex gap="2" align="center">
              <Text size="2" weight="bold" style={{ wordBreak: "break-all" }}>
                {nodeName}
              </Text>

            </Flex>



            {/* IP address stays underneath */}
            <Text as="div" size="2" color="gray">
              {details.ip}
            </Text>
          </Box>
        </Flex>

        <Badge color={isReady ? "green" : "red"} size="1" variant="soft">
          {details.status?.STATUS ?? "Unknown"}
        </Badge>

        {/* 2. Divider & Type */}
        <Flex style={{ width: "10%", borderLeft: "1px solid var(--gray-5)", paddingLeft: "16px" }}>
          <Text as="div" size="2" weight="bold">
            {details.workload_class}
          </Text>
        </Flex>

        {/* 3. Resources (Pods & CPU) */}
        <Flex gap="4" style={{ flexGrow: 1 }}>
          <Box style={{ flex: 1 }}>
            <Text as="div" size="1" mb="1">
              Pods {details.resources.non_terminated_pods}/{details.allocatable_pods}
            </Text>
            <Progress
              value={podUsage}
              size="1"
              variant="soft"
              color={getStatusColor(podUsage)}
              style={{ height: '8px' }}
            />
          </Box>
          <Box style={{ flex: 1 }}>
            <Text as="div" size="1" mb="1">
              {details.cpu_capacity} CPU ({details.resources.cpu_requests_pct})
            </Text>
            <Progress
              value={cpuPct}
              size="1"
              variant="soft"
              color={getStatusColor(cpuPct)}
              style={{ height: '8px' }}
            />
          </Box>
          <Box style={{ flex: 1 }}>
            <Text as="div" size="1" mb="1">
              {details.memory_capacity_gi} Memory ({details.resources.memory_requests_pct})
            </Text>
            <Progress
              value={memPct}
              size="1"
              variant="soft"
              color={getStatusColor(memPct)}
              style={{ height: '8px' }}
            />
          </Box>
        </Flex>
        {/* 4. Details Button Section */}
        <Flex align="center" pl="2">
          <Dialog.Root>
            <Dialog.Trigger>
              {/* The trigger button */}
              <Button variant="outline" size="2" color="gray" style={{ cursor: 'pointer' }}>
                Describe
              </Button>
            </Dialog.Trigger>

            <Dialog.Content style={{ maxWidth: "70vw", width: "95vw" }}>
              {/* Title for accessibility */}
              <Dialog.Title hidden>Node Details for {nodeName}</Dialog.Title>

              {/* Wrap your component in a scrollable box so the Modal doesn't grow forever */}
              <Box id={`scroll-root-${nodeName}`}>
                <NodeTempDescribeSections
                  fileName={fileName}
                  node={nodeName}
                />
              </Box>

              <Flex gap="3" mt="4" justify="end">
                <Dialog.Close>
                  <Button variant="soft" color="gray">
                    Close
                  </Button>
                </Dialog.Close>
              </Flex>
            </Dialog.Content>
          </Dialog.Root>
        </Flex>
      </Flex>
    </Card>
  );
}

