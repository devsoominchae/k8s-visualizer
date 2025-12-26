import { Heading, Text, Flex, Spinner } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import Card from "./Card";
import { fetchEnvInfo } from "../../api/env";

type Props = {
  fileName: string;
};

type EnvInfo = {
  cluster: string;
  namespace: string;
  status: string;
};

export default function EnvCard({ fileName }: Props) {
  const [data, setData] = useState<EnvInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnvInfo(fileName)
      .then(setData)
      .finally(() => setLoading(false));
  }, [fileName]);

  if (loading) {
    return (
      <Card>
        <Spinner />
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <Text color="red">Failed to load</Text>
      </Card>
    );
  }

  return (
    <Card>
      <Flex direction="column" gap="2">
        <Heading size="3">Environment</Heading>
        <Text size="2">Cluster: {data.cluster}</Text>
        <Text size="2">Namespace: {data.namespace}</Text>
        <Text size="2">Status: {data.status}</Text>
      </Flex>
    </Card>
  );
}
