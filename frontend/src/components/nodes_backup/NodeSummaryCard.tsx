import { Card, Flex, Heading, Text, Badge, Spinner } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { fetchNodeGet } from "../../api/node";

type Props = {
  fileName: string;
  node: string;
};

// type NodeCondition = {
//   type: string;
//   status: string;
//   reason?: string;
// };

// type NodeStatus = {
//   name?: string;
//   roles?: string[] | string;
//   osImage?: string;
//   kernelVersion?: string;
//   kubeletVersion?: string;
//   conditions?: NodeCondition[];
// };

// type NodeStatus = {
//   [key: string]: string | undefined;
// };

export default function NodeSummaryCard({ fileName, node }: Props) {
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetchNodeGet(fileName)
      .then(setData)
      .catch(() => setError("Failed to load node summary"))
      .finally(() => setLoading(false));
  }, [fileName]);

  if (loading) {
    return (
      <Card style={{ minWidth: 340 }}>
        <Flex align="center" justify="center" height="140px">
          <Spinner />
        </Flex>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card style={{ minWidth: 340 }}>
        <Flex align="center" justify="center" height="140px">
          <Text color="red">{error ?? "No node data available"}</Text>
        </Flex>
      </Card>
    );
  }

  /** ✅ Derive Ready status properly */
  // console.log(data[node])
  // const readyCondition = Array.isArray(data.conditions)
  //   ? data.conditions.find((c) => c.type === "Ready")
  //   : undefined;

  // const isReady = readyCondition?.status === "True";

  const currentNode = data?.[node];
  const rawStatus = currentNode?.["STATUS"];
  const isReady = rawStatus?.toLowerCase() === "ready";

  const currrentRoles = currentNode?.["ROLES"];
  const currrentAge = currentNode?.["AGE"];
  const currrentVersion = currentNode?.["VERSION"];
  const currrentInternalIP = currentNode?.["INTERNAL-IP"];
  const currrentExternalIP = currentNode?.["EXTERNAL-IP"];
  const currrentOSImage = currentNode?.["OS-IMAGE"];
  const currrentKernalVersion = currentNode?.["KERNEL-VERSION"];
  const currrentContainerRuntime = currentNode?.["CONTAINER-RUNTIME"];

  /** Normalize roles */
  const roles =
    Array.isArray(data.roles)
      ? data.roles
      : typeof data.roles === "string"
      ? [data.roles]
      : [];

  return (
    <Card style={{ minWidth: 340 }}>
      <Flex direction="column" gap="3">
        <Heading size="4">{node}</Heading>

        {/* Status */}
        <Flex gap="2" align="center">
          <Text size="2">
            <strong>Status:</strong>
          </Text>
          <Badge color={isReady ? "green" : "red"}>
            {isReady ? "Ready" : "Not Ready"}
          </Badge>
        </Flex>

        {/* Roles */}
        {currrentRoles && (
          <Text size="2">
            <strong>Roles:</strong> {currrentRoles}
          </Text>
        )}

        {/* Age */}
        {currrentAge && (
          <Text size="2">
            <strong>Age:</strong> {currrentAge}
          </Text>
        )}

        {currrentVersion && (
          <Text size="2">
            <strong>Kubelet:</strong> {currrentVersion}
          </Text>
        )}

        {currrentInternalIP && (
          <Text size="2">
            <strong>Internal IP:</strong> {currrentInternalIP}
          </Text>
        )}

        {currrentExternalIP && (
          <Text size="2">
            <strong>External IP:</strong> {currrentExternalIP}
          </Text>
        )}


        {currrentOSImage && (
          <Text size="2">
            <strong>OS:</strong> {currrentOSImage}
          </Text>
        )}
        
        {currrentKernalVersion && (
          <Text size="2">
            <strong>Kernel:</strong> {currrentKernalVersion}
          </Text>
        )}

        {currrentContainerRuntime && (
          <Text size="2">
            <strong>Container Runtine:</strong> {currrentContainerRuntime}
          </Text>
        )}

        {/* Conditions */}
        {/* {Array.isArray(data.conditions) && data.conditions.length > 0 && (
          <>
            <Heading size="3" mt="3">
              Conditions
            </Heading>

            <Flex direction="column" gap="1">
              {data.conditions.map((c) => (
                <Flex key={c.type} justify="between" align="center">
                  <Text size="2">{c.type}</Text>
                  <Badge color={c.status === "True" ? "green" : "red"}>
                    {c.status}
                  </Badge>
                </Flex>
              ))}
            </Flex>
          </>
        )} */}
      </Flex>
    </Card>
  );
}
