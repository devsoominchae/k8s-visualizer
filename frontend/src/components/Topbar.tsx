import { Box, Heading } from "@radix-ui/themes";

type Props = {
  title: string;
};

export default function Topbar({ title }: Props) {
  return (
    <Box p="4" style={{ borderBottom: "1px solid var(--gray-a6)" }}>
      <Heading size="4">{title}</Heading>
    </Box>
  );
}
