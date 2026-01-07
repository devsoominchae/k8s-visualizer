import { Heading, Text, Flex, Badge, Spinner, Card } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { fetchPodWorkloadClass } from "../../api/env";

type Props = {
  fileName: string;
};

type PodWorkloadMap = {
  [key: string]: string[];
};

export default function PodCard({ fileName }: Props) {
  const [data, setData] = useState<PodWorkloadMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetchPodWorkloadClass(fileName)
      .then(setData)
      .catch(() => {
        setError("Unable to load pod workload information");
      })
      .finally(() => setLoading(false));
  }, [fileName]);

  return (
    <Card
      style={{
        padding: 24,
        borderRadius: 14,
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        border: "1px solid var(--gray-a5)",
      }}
    >
      {/* Loading */}
      {loading && (
        <Flex align="center" justify="center" height="140px">
          <Spinner />
        </Flex>
      )}

      {/* Error */}
      {!loading && error && (
        <Flex align="center" justify="center" height="140px">
          <Text color="red">{error}</Text>
        </Flex>
      )}

      {/* Success */}
      {!loading && !error && data && (
        <Flex direction="column" gap="4">
          <Heading size="4">Pods (by workload)</Heading>

          {Object.entries(data).map(([workload, pods]) => (
            <Flex
              key={workload}
              justify="between"
              align="center"
              style={{
                padding: "12px 14px",
                borderRadius: 8,
                background: "var(--gray-a2)",
              }}
            >
              <Text style={{ textTransform: "capitalize" }}>
                {workload}
              </Text>
              <Badge
                style={{
                  backgroundColor: "#006DCF",
                  color: "white",
                }}
              >
                {pods.length}
              </Badge>
            </Flex>
          ))}
        </Flex>
      )}
    </Card>
  );
}
