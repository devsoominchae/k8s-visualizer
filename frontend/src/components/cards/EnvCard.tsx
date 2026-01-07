import { Heading, Text, Flex, Spinner, Badge, Card } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { fetchEnvInfo } from "../../api/env";

type Props = {
  fileName: string;
};

type EnvInfo = {
  namespace?: string;
  version?: string;
  site_number?: string;
  order?: string;
  license_expires?: string;
  tls_mode?: string;
};

export default function EnvCard({ fileName }: Props) {
  const [data, setData] = useState<EnvInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetchEnvInfo(fileName)
      .then(setData)
      .catch(() => {
        setError("Unable to load environment information");
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
        marginBottom: 24,
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
          <Flex justify="between" align="center">
            <Heading size="4">Environment</Heading>
            <Badge
              style={{
                backgroundColor: "#006DCF",
                color: "white",
              }}
            >
              {data.tls_mode ?? "full-stack"}
            </Badge>
          </Flex>

          <Text><strong>Namespace:</strong> {data.namespace ?? "-"}</Text>
          <Text><strong>Version:</strong> {data.version ?? "-"}</Text>
          <Text><strong>Site Number:</strong> {data.site_number ?? "-"}</Text>
          <Text><strong>Order:</strong> {data.order ?? "-"}</Text>
          <Text><strong>License:</strong> {data.license_expires ?? "-"}</Text>
        </Flex>
      )}
    </Card>
  );
}
