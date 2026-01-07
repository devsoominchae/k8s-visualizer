import { Card, Flex, Heading, Text, Spinner, Select } from "@radix-ui/themes";
import { useEffect, useRef, useState } from "react";
import { fetchNodeDescribeSections, fetchNodeDescribe } from "../../api/node";

type Props = {
  fileName: string;
  node: string;
};

// Define the static list of headers to look for in the raw text
const SECTION_HEADERS = [
  "Name", "Roles", "Labels", "Annotations", "CreationTimestamp",
  "Taints", "Unschedulable", "Lease", "Conditions", "Addresses",
  "Capacity", "Allocatable", "System Info", "PodCIDR", "PodCIDRs",
  "Non-terminated Pods", "Allocated resources", "Events"
];

export default function NodeDescribeSections({ fileName, node }: Props) {
  const [sections, setSections] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sectionRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const parseDescribeOutput = (text: string) => {
    if (!text) return [];
    // Escape headers for regex and join
    const pattern = new RegExp(`^(${SECTION_HEADERS.join('|')}):?`, 'gm');
    const matches = [...text.matchAll(pattern)];

    return matches.map((match, i) => {
      const start = match.index!;
      const end = matches[i + 1] ? matches[i + 1].index! : text.length;
      return text.slice(start, end).trim();
    });
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    // Fetch the raw describe text
    fetchNodeDescribe(fileName)
      .then((res) => {
        if (!isMounted) return;
        
        const nodeDescribe = res?.[node];
        if (!nodeDescribe) {
          throw new Error("No describe output found for this node");
        }

        // Parse that big string into sections based on our headers
        const parsed = parseDescribeOutput(nodeDescribe);
        setSections(parsed);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Describe fetch error:", err);
        setError("Unable to load node describe output");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [fileName, node]);

  function scrollToSection(index: number) {
    const el = sectionRefs.current[index];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  if (loading) {
    return (
      <Card style={{ flex: 1 }}>
        <Flex align="center" justify="center" height="200px">
          <Spinner />
        </Flex>
      </Card>
    );
  }

  if (error || sections.length === 0) {
    return (
      <Card style={{ flex: 1 }}>
        <Flex align="center" justify="center" height="200px">
          <Text color={error ? "red" : "gray"}>{error ?? "No describe output available"}</Text>
        </Flex>
      </Card>
    );
  }

  return (
    <Card style={{ flex: 1, padding: "16px" }}>
      <Flex direction="column" gap="4">
        <Flex justify="between" align="center">
          <Heading size="4">Node Describe</Heading>

          <Select.Root onValueChange={(v) => scrollToSection(Number(v))}>
            <Select.Trigger placeholder="Jump to section" />
            <Select.Content>
              {sections.map((section, idx) => {
                // The first line is usually the header
                const title = SECTION_HEADERS.find(h => section.startsWith(h)) || `Section ${idx + 1}`;
                return (
                  <Select.Item key={idx} value={String(idx)}>
                    {title}
                  </Select.Item>
                );
              })}
            </Select.Content>
          </Select.Root>
        </Flex>

        <Flex direction="column" gap="4">
          {sections.map((section, idx) => (
            <div
              key={idx}
              ref={(el) => { sectionRefs.current[idx] = el; }}
              style={{ scrollMarginTop: "20px" }}
            >
              <Card variant="surface" style={{ padding: "12px" }}>
                <pre
                  style={{
                    margin: 0,
                    padding: "11px",
                    fontSize: "13px",
                    fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace', // Better font stack
                    lineHeight: "1.6",             // Increased from 1.4 for better vertical breathing room
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    color: "var(--gray-12)",       // High contrast text
                    // backgroundColor: "var(--gray-2)", // Subtle background
                    borderRadius: "var(--radius-2)",
                    letterSpacing: "-0.01em",      // Modern monospace looks better slightly tighter
                  }}
                >
                  {section}
                </pre>
              </Card>
            </div>
          ))}
        </Flex>
      </Flex>
    </Card>
  );
}