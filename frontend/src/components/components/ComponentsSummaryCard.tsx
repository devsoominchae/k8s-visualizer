// src/components/pods_temp/ComponentsSummaryCard.tsx

import { Card, Flex, Text, Box, Button, Dialog } from "@radix-ui/themes";

import ComponentDescribeSections from "./ComponentsDescribe"

type ComponentsDetails = Record<string, string>;

interface ComponentsCardProps {
  fileName: string;
  component: string;
  componentName: string; // The specific resource name (e.g., pod name, node name)
  details: ComponentsDetails;
  visibleColumns: string[]; // Added this to receive user-selected columns
  describeMap: Record<string, Record<string, string>>;
}

function capitalize(str: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function ComponentsSummaryCard({
  fileName,
  component,
  componentName,
  details,
  visibleColumns,
  describeMap,
}: ComponentsCardProps) {

  // 1. Status Logic for the side stripe
  const statusValue = details["STATUS"] || details["status"] || "Unknown";

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s === "running" || s === "ready" || s === "active" || s === "online") return "var(--green-9)";
    if (s === "pending" || s === "waiting" || s === "starting") return "var(--orange-9)";
    if (s === "error" || s === "failed" || s === "crashloopbackoff" || s === "offline") return "var(--red-9)";
    return "var(--gray-8)";
  };


  return (
    <Card size="1" style={{ padding: 0, overflow: 'hidden' }}>
      <Flex align="stretch">

        {/* INDICATOR STRIPE */}
        <Box
          style={{
            width: '6px',
            backgroundColor: getStatusColor(statusValue),
            flexShrink: 0
          }}
        />

        {/* MAIN DATA ROW */}
        <Flex align="center" style={{ flexGrow: 1 }} py="2">

          {/* NAME COLUMN (Always Visible) */}
          <Box px="3" style={{ flex: '2', minWidth: '200px' }}>
            <Text size="1" color="gray" mb="1" style={{ display: 'block', fontSize: '10px', fontWeight: 'bold' }}>
              NAME
            </Text>
            <Text size="2" weight="bold" style={{ wordBreak: 'break-all' }}>
              {componentName}
            </Text>
          </Box>

          {/* USER-SELECTED DYNAMIC COLUMNS */}
          {visibleColumns.map((key) => {
            // Only render if the key actually exists in this specific item's details
            if (!details[key] && details[key] !== "0") return null;

            return (
              <Box
                key={key}
                px="3"
                style={{
                  flex: '1',
                  borderLeft: '1px solid var(--gray-4)',
                  minWidth: '100px'
                }}
              >
                <Text size="1" color="gray" mb="1" style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>
                  {key}
                </Text>
                <Text size="2" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                  {details[key]}
                </Text>
              </Box>
            );
          })}

          {/* ACTION COLUMN */}
          <Flex px="3" align="center" style={{ borderLeft: '1px solid var(--gray-4)', minWidth: '100px' }}>
            <Dialog.Root>
              <Dialog.Trigger>
                <Button variant="ghost" size="1" color="gray" style={{ cursor: 'pointer' }}>
                  Describe
                </Button>
              </Dialog.Trigger>

              <Dialog.Content style={{ maxWidth: "70vw", width: "95vw" }}>
                <Dialog.Title size="3">{capitalize(component)}</Dialog.Title>
                <Box id={`scroll-root-${componentName}`}>
                  <ComponentDescribeSections
                    fileName={fileName}
                    component={component}
                    componentName={componentName}
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