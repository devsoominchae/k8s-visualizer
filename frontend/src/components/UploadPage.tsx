import {
  Flex,
  Heading,
  Text,
  Card,
  Box,
  Badge,
  Spinner,
  Dialog,
} from "@radix-ui/themes";
import { useRef, useState } from "react";
import { uploadArchive } from "../api/upload";

type Props = {
  onSuccess: (fileName: string) => void;
};

export default function UploadPage({ onSuccess }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openFileDialog() {
    if (!loading) fileInputRef.current?.click();
  }

  async function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    try {
      setError(null);
      setLoading(true);

      const fileName = await uploadArchive(file);

      onSuccess(fileName);
    } catch (err) {
      setError("Failed to process archive. Please try again.");
      setLoading(false);
    }
  }

  return (
    <>
      {/* MAIN CONTENT */}
      <Flex
        align="center"
        justify="center"
        style={{
          width: "100vw",
          height: "100vh",
          backgroundColor: "#f5f6f8",
        }}
      >
        <Flex direction="column" align="center" gap="6">
          {/* Header */}
          <Flex direction="column" align="center" gap="2">
            <Heading size="7">K8s Visualizer</Heading>
            <Text size="3" color="gray">
              Analyze SAS Viya Kubernetes environments
            </Text>
          </Flex>

          {/* Upload Card */}
          <Card
            onClick={openFileDialog}
            style={{
              width: 520,
              padding: 32,
              borderRadius: 16,
              boxShadow: "0 16px 40px rgba(0,0,0,0.12)",
              border: "1px solid var(--gray-a5)",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            <Flex direction="column" align="center" gap="4">
              <Box
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: "rgba(0,109,207,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 32,
                  color: "#006DCF",
                }}
              >
                ⬆️
              </Box>

              <Heading size="4">Upload get-k8s-info.tgz</Heading>

              <Text color="gray" align="center">
                Click to upload the file collected from using
                <br />
                get-k8s-info tool.
              </Text>

              <Badge
                style={{
                  backgroundColor: "#006DCF",
                  color: "white",
                  padding: "6px 14px",
                  borderRadius: 6,
                }}
              >
                Select file
              </Badge>

              {error && (
                <Text color="red" size="2">
                  {error}
                </Text>
              )}
            </Flex>
          </Card>

          <Text size="1" color="gray">
            Supported format: <strong>.tgz</strong>
          </Text>

          {/* Hidden input */}
          <input
            type="file"
            ref={fileInputRef}
            hidden
            onChange={onFileSelected}
          />
        </Flex>
      </Flex>

      {/*Processing Part*/}
      <Dialog.Root open={loading}>
        <Dialog.Content
          style={{
            maxWidth: 360,
            textAlign: "center",
          }}
        >
          <Dialog.Title>Uploading archive!</Dialog.Title>

          <Flex direction="column" align="center" gap="4" mt="4">
            <Spinner size="3" />
            <Text color="gray">
              Uploading your file...
              <br />
              This may take a moment 🙏
            </Text>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}
