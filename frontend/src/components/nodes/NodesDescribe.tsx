import { Card, Flex, Heading, Text, Spinner, Select, Box } from "@radix-ui/themes";
import { useEffect, useRef, useState } from "react";
import { fetchNodeDescribeSections, fetchNodeDescribe } from "../../api/node";

type Props = {
    fileName: string;
    node: string;
};

export default function NodeDescribeSections({ fileName, node }: Props) {
    const [sections, setSections] = useState<string[]>([]);
    const [dynamicHeaders, setDynamicHeaders] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const sectionRefs = useRef<Record<number, HTMLDivElement | null>>({});

    const parseDescribeOutput = (text: string, headers: string[]) => {
        if (!text || headers.length === 0) return [];
        // Escape headers for regex and join
        const pattern = new RegExp(`^(${headers.join('|')}):?`, 'gm');
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

        // Fetch headers AND describe data simultaneously
        Promise.all([
            fetchNodeDescribeSections(fileName),
            fetchNodeDescribe(fileName)
        ])
            .then(([headerRes, describeRes]) => {
                if (!isMounted) return;

                // Extract the headers array (adjusting for potential object wrapper)
                const headers = Array.isArray(headerRes) ? headerRes : (headerRes?.[node] || []);
                const nodeDescribe = describeRes?.[node];

                if (!nodeDescribe) throw new Error("No describe output found");

                setDynamicHeaders(headers);
                setSections(parseDescribeOutput(nodeDescribe, headers));
            })
            .catch((err) => {
                if (!isMounted) return;
                console.error("Fetch error:", err);
                setError("Unable to load node data");
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => { isMounted = false; };
    }, [fileName, node]);

    function scrollToSection(index: number) {
        const el = sectionRefs.current[index];
        if (el) {
            el.scrollIntoView({ behavior: "instant", block: "start" });
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
        <Box
            style={{
                height: "80vh",
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden' // Keeps the main container from scrolling
            }}
        >
            {/* --- FIXED HEADER --- */}
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
                <Heading size="4">Node Describe</Heading>
                <Select.Root onValueChange={(v) => scrollToSection(Number(v))}>
                    <Select.Trigger placeholder="Jump to section" variant="soft" color="gray" />
                    <Select.Content position="popper">
                        {sections.map((section, idx) => {
                            const title = dynamicHeaders.find(h => section.startsWith(h)) || `Section ${idx + 1}`;
                            return (
                                <Select.Item key={idx} value={String(idx)}>
                                    {title}
                                </Select.Item>
                            );
                        })}
                    </Select.Content>
                </Select.Root>
            </Flex>

            {/* --- SCROLLABLE CONTENT --- */}
            <Box
                p="4"
                style={{
                    overflowY: "auto",
                    flex: 1,
                    backgroundColor: 'var(--gray-2)' // Subtle contrast for the background
                }}
            >
                <Flex direction="column" gap="4">
                    {sections.map((section, idx) => (
                        <div
                            key={idx}
                            ref={(el) => { sectionRefs.current[idx] = el; }}
                            style={{ scrollMarginTop: "10px" }}
                        >
                            <Card variant="surface" style={{ padding: "0", overflow: 'hidden' }}>
                                <pre
                                    style={{
                                        margin: 0,
                                        padding: "11px",
                                        fontSize: "13px",
                                        fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace',
                                        lineHeight: "1.6",
                                        whiteSpace: "pre-wrap",
                                        wordBreak: "break-word",
                                        color: "var(--gray-12)",
                                        borderRadius: "var(--radius-2)",
                                        letterSpacing: "-0.01em",
                                    }}
                                >
                                    {section}
                                </pre>
                            </Card>
                        </div>
                    ))}
                </Flex>
            </Box>
        </Box>
    );
}