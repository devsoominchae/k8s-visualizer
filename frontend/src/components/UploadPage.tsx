import { Flex, Heading, Text, Card } from "@radix-ui/themes";
import { useRef } from "react";

type Props = {
  onSuccess: (fileName: string) => void;
};

export default function UploadPage({ onSuccess }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function openFileDialog() {
    fileInputRef.current?.click();
  }

  async function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    // TEMP (until POST upload is wired):
    // simulate backend response using full path style
    const simulatedFileName = `/home/admin/sample/${file.name}`;

    onSuccess(simulatedFileName);
  }

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      height="100vh"
      gap="5"
    >
      <Heading size="6">K8s-Visualizer</Heading>
      <Text color="gray">Upload your environment file to continue</Text>

      <input
        type="file"
        ref={fileInputRef}
        hidden
        onChange={onFileSelected}
      />

      <Card
        onClick={openFileDialog}
        style={{
          width: 420,
          height: 220,
          border: "2px dashed var(--gray-a7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <Text size="3">Click to upload file</Text>
      </Card>
    </Flex>
  );
}
