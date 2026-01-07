import { Tabs, Text } from "@radix-ui/themes";

type Props = {
  nodes: string[];
  activeNode: string;
  onSelect: (node: string) => void;
};

export default function NodeSelector({
  nodes,
  activeNode,
  onSelect,
}: Props) {
  return (
    <Tabs.Root
      value={activeNode}
      onValueChange={onSelect}
      style={{ width: "100%" }}
    >
      <Tabs.List
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        {nodes.map((node) => (
          <Tabs.Trigger
            key={node}
            value={node}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              fontSize: 13,
            }}
          >
            <Text>{node}</Text>
          </Tabs.Trigger>
        ))}
      </Tabs.List>
    </Tabs.Root>
  );
}


