import { Card, Flex, Heading, Text, Spinner, Select, Box } from "@radix-ui/themes";
import { useEffect, useRef, useState } from "react";

type Props = {
    nodeName: string;
    describeMap: Record<string, Record<string, string>>;
};

interface ParsedSection {
    title: string;
    content: string;
}

export default function NodeDescribeSections({ nodeName, describeMap }: Props) {
    const [sections, setSections] = useState<ParsedSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const sectionRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setError(null);

        try {
            // Access the specific node's data
            const nodeData = describeMap?.[nodeName];

            if (!nodeData) {
                if (isMounted) {
                    setSections([]);
                    setLoading(false);
                }
                return;
            }

            // Map the object keys/values into our sections array
            const parsedData: ParsedSection[] = Object.entries(nodeData).map(
                ([title, content]) => ({
                    title,
                    content: typeof content === 'string' ? content : JSON.stringify(content, null, 2)
                })
            );

            if (isMounted) {
                setSections(parsedData);
            }
        } catch (err) {
            if (isMounted) {
                console.error("Node data processing error:", err);
                setError(`Unable to load details for ${nodeName}`);
            }
        } finally {
            if (isMounted) {
                setLoading(false);
            }
        }

        return () => { isMounted = false; };
    }, [nodeName, describeMap]);

    function scrollToSection(index: number) {
        const el = sectionRefs.current[index];
        if (el) {
            el.scrollIntoView({ behavior: "instant", block: "start" });
        }
    }

    if (loading) {
        return (
            <Flex align="center" justify="center" height="200px">
                <Spinner size="3" />
            </Flex>
        );
    }

    if (error || sections.length === 0) {
        return (
            <Flex align="center" justify="center" height="200px">
                <Text color={error ? "red" : "gray"}>{error ?? "No node data available"}</Text>
            </Flex>
        );
    }

    return (
        <Box
            style={{
                height: "80vh",
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}
        >
            {/* FIXED HEADER */}
            <Flex
                justify="between"
                align="center"
                p="4"
                style={{
                    backgroundColor: 'var(--color-panel-solid)',
                    borderBottom: '1px solid var(--gray-4)',
                    zIndex: 10,
                }}
            >
                <Heading size="3">{nodeName}</Heading>

                <Select.Root onValueChange={(v) => scrollToSection(Number(v))}>
                    <Select.Trigger placeholder="Jump to section" variant="soft" color="gray" />
                    <Select.Content position="popper">
                        {sections.map((section, idx) => (
                            <Select.Item key={idx} value={String(idx)}>
                                {section.title}
                            </Select.Item>
                        ))}
                    </Select.Content>
                </Select.Root>
            </Flex>

            {/* SCROLLABLE CONTENT */}
            <Box p="3" style={{ overflowY: "auto", flex: 1, backgroundColor: 'var(--gray-2)' }}>
                <Flex direction="column" gap="3">
                    {sections.map((section, idx) => (
                        <div
                            key={idx}
                            ref={(el) => { sectionRefs.current[idx] = el; }}
                            style={{ scrollMarginTop: "10px" }}
                        >
                            <Text size="2" weight="bold" mb="1" color="gray" style={{ display: 'block' }}>
                                {section.title}
                            </Text>
                            <Card variant="surface" style={{ padding: "0", overflow: 'hidden' }}>
                                <pre
                                    style={{
                                        margin: 0,
                                        padding: "11px",
                                        fontSize: "13px",
                                        fontFamily: 'Menlo, Monaco, Consolas, monospace',
                                        lineHeight: "1.6",
                                        whiteSpace: "pre-wrap",
                                        wordBreak: "break-word",
                                        color: "var(--gray-12)",
                                    }}
                                >
                                    {section.content}
                                </pre>
                            </Card>
                        </div>
                    ))}
                </Flex>
            </Box>
        </Box>
    );
}