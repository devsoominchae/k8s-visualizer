import { Flex, Box } from "@radix-ui/themes";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Dashboard from "./Dashboard";

type Props = {
  fileName: string;
};

export default function DashboardLayout({ fileName }: Props) {
  return (
    <Flex direction="column" height="100vh">
      <Topbar title="k8s-visualizer" />

      <Flex flexGrow="1">
        <Sidebar />
        <Box p="4" flexGrow="1">
          <Dashboard fileName={fileName} />
        </Box>
      </Flex>
    </Flex>
  );
}
