import { Flex, Box } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import Sidebar, { Screen } from "./Sidebar";
import Topbar from "./Topbar";
import Dashboard from "./Dashboard";
import NodesPage from "./nodes/NodesPage";
import ComponentsPage from "./components/ComponentsPage";

type Props = {
  fileName: string;
  // Making 'component' optional with '?' prevents errors if the parent 
  // doesn't pass it, and allows us to use it for initial routing.
  component?: string;
};

export default function DashboardLayout({ fileName, component }: Props) {
  // Initialize state based on the 'component' prop passed from parent.
  // We cast it as 'Screen' to match the Sidebar's expected type.
  const [screen, setScreen] = useState<Screen>((component as Screen) || "details");

  // Optional: Sync state if the 'component' prop changes externally
  useEffect(() => {
    if (component) {
      setScreen(component as Screen);
    }
  }, [component]);

  function renderContent() {
    switch (screen) {
      case "details":
        return <Dashboard fileName={fileName} />;

      case "nodes_temp":
        return <NodesPage fileName={fileName} />;

      case "pods":
        return <ComponentsPage fileName={fileName} component="pods" />;

      case "deployments":
        return <ComponentsPage fileName={fileName} component="deployments" />;

      case "services":
        return <ComponentsPage fileName={fileName} component="services" />;

      case "statefulsets":
        return <ComponentsPage fileName={fileName} component="statefulsets" />;

      case "daemonsets":
        return <ComponentsPage fileName={fileName} component="daemonsets" />;

      case "replicasets":
        return <ComponentsPage fileName={fileName} component="replicasets" />;

      case "persistentvolumeclaims":
        return <ComponentsPage fileName={fileName} component="persistentvolumeclaims" />;

      case "configmaps":
        return <ComponentsPage fileName={fileName} component="configmaps" />;

      case "cronjobs":
        return <ComponentsPage fileName={fileName} component="cronjobs" />;

      case "endpoints":
        return <ComponentsPage fileName={fileName} component="endpoints" />;

      case "jobs":
        return <ComponentsPage fileName={fileName} component="jobs" />;

      case "rolebindings":
        return <ComponentsPage fileName={fileName} component="rolebindings" />;

      case "roles":
        return <ComponentsPage fileName={fileName} component="roles" />;

      case "secrets":
        return <ComponentsPage fileName={fileName} component="secrets" />;

      case "securitycontextconstraints":
        return <ComponentsPage fileName={fileName} component="securitycontextconstraints" />;

      case "serviceaccounts":
        return <ComponentsPage fileName={fileName} component="serviceaccounts" />;

      default:
        return <Dashboard fileName={fileName} />;
    }
  }

  return (
    <Flex direction="column" height="100vh">
      {/* Top bar */}
      <Topbar title="k8s-visualizer" />

      {/* Main layout */}
      <Flex flexGrow="1" overflow="hidden">
        {/* Sidebar navigation */}
        <Sidebar active={screen} onSelect={setScreen} />

        {/* Main Content Area */}
        <Box
          flexGrow="1"
          p="5"
          overflow="auto"
          style={{
            background: "var(--gray-a1)",
          }}
        >
          {renderContent()}
        </Box>
      </Flex>
    </Flex>
  );
}