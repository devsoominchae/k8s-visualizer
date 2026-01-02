import { Flex, Box, Text } from "@radix-ui/themes";
import { useState } from "react";
import Sidebar, { Screen } from "./Sidebar";
import Topbar from "./Topbar";
import Dashboard from "./Dashboard";

type Props = {
  fileName: string;
};

export default function DashboardLayout({ fileName }: Props) {
  const [screen, setScreen] = useState<Screen>("details");

  function renderContent() {
    switch (screen) {
      case "details":
        return <Dashboard fileName={fileName} />;

      case "nodes":
        return <Text color="gray">Nodes page (coming soon)</Text>;

      case "workloads":
        return <Text color="gray">Workloads page (coming soon)</Text>;

      default:
        return null;
    }
  }

  return (
    <Flex direction="column" height="100%">
      <Topbar title="k8s-visualizer" />

      <Flex flexGrow="1" overflow="hidden">
        <Sidebar active={screen} onSelect={setScreen} />

        <Box
          flexGrow="1"
          p="4"
          overflow="auto"
          style={{ background: "var(--gray-a1)" }}
        >
          {renderContent()}
        </Box>
      </Flex>
    </Flex>
  );
}
