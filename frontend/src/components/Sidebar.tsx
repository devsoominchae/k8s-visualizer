import { Box, Flex, Text } from "@radix-ui/themes";

export type Screen = "details" | "nodes" | "workloads";

type Props = {
  active: Screen;
  onSelect: (screen: Screen) => void;
};

export default function Sidebar({ active, onSelect }: Props) {
  const items: { key: Screen; label: string }[] = [
    { key: "details", label: "Details" },
    { key: "nodes", label: "Nodes" },
    { key: "workloads", label: "Workloads" },
  ];

  return (
    <Box
      width="220px"
      p="4"
      style={{
        borderRight: "1px solid var(--gray-a6)",
        background: "var(--gray-a1)",
      }}
    >
      <Flex direction="column" gap="3">
        <Text weight="bold" style={{ color: "#006DCF" }}>
          Navigation
        </Text>

        <Box style={{ borderBottom: "1px solid var(--gray-a5)", marginBottom: 8 }} />

        {items.map((item) => {
          const isActive = active === item.key;

          return (
            <Box
              key={item.key}
              onClick={() => onSelect(item.key)}
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                cursor: "pointer",
                background: isActive ? "rgba(0,109,207,0.12)" : "transparent",
                color: isActive ? "#006DCF" : "inherit",
                fontWeight: isActive ? 600 : 400,
              }}
              onMouseEnter={(e) => {
                if (!isActive)
                  e.currentTarget.style.background = "var(--gray-a3)";
              }}
              onMouseLeave={(e) => {
                if (!isActive)
                  e.currentTarget.style.background = "transparent";
              }}
            >
              {item.label}
            </Box>
          );
        })}
      </Flex>
    </Box>
  );
}
