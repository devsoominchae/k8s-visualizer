// src/components/components/ComponentDescribeSections.tsx

import { Card, Flex, Heading, Text, Spinner, Select, Box } from "@radix-ui/themes";
import { useEffect, useRef, useState } from "react";
import { fetchComponentDescribeSections, fetchComponentDescribe } from "../../api/component";

type Props = {
    fileName: string;
    component: string;
    componentName: string;
    describeMap: Record<string, any>
    describeHeaderMap: Record<string, any>
};

// Define a unified interface to keep headers and content in sync
interface ParsedSection {
    title: string;
    content: string;
}

export default function ComponentDescribeSections({ fileName, component, componentName, describeMap, describeHeaderMap }: Props) {
    const [sections, setSections] = useState<ParsedSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // FIX ts(7015): Define the ref with an index signature for dynamic access
    const sectionRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

    /**
     * Parses the raw describe text into objects containing the found header and the text body.
     */
    const parseDescribeOutput = (text: string, headers: string[]): ParsedSection[] => {
        if (!text) return [];
        if (headers.length === 0) return [{ title: "Output", content: text }];

        // Escape headers for Regex safety (handles dots/special chars in K8s keys)
        const escaped = headers.map(h => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        const pattern = new RegExp(`^(${escaped.join('|')})\\b:?`, 'gm');
        const matches = [...text.matchAll(pattern)];

        if (matches.length === 0) return [{ title: "Output", content: text }];

        return matches.map((match, i) => {
            const start = match.index!;
            const end = matches[i + 1] ? matches[i + 1].index! : text.length;

            return {
                title: match[1], // Capture the actual header found in the text
                content: text.slice(start, end).trim()
            };
        });
    };

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setError(null);

        try {
            const rawText = describeMap?.[componentName];
            const headers = describeHeaderMap?.[componentName];

            if (!rawText) {
                // If data isn't ready yet, we just wait (don't throw error immediately)
                if (isMounted) setLoading(false);
                return;
            }

            // Parse data
            const parsedData = parseDescribeOutput(rawText, headers || []);

            if (isMounted) {
                setSections(parsedData);
            }
        } catch (err) {
            if (isMounted) {
                console.error("Parsing error:", err);
                setError(`Unable to load details for ${componentName}`);
            }
        } finally {
            if (isMounted) {
                setLoading(false);
            }
        }

        return () => { isMounted = false; };
    }, [fileName, component, componentName, describeMap, describeHeaderMap]);
    // Added maps to dependencies so it re-runs when data arrives

    function scrollToSection(index: number) {
        const el = sectionRefs.current[index];
        if (el) {
            // Using "smooth" for better UX, or "instant" per your original code
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
                <Text color={error ? "red" : "gray"}>{error ?? "No data available"}</Text>
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
            {/* FIXED NAV HEADER */}
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
                <Heading size="3">{componentName}</Heading>

                <Select.Root onValueChange={(v) => scrollToSection(Number(v))}>
                    <Select.Trigger placeholder="Jump to section" variant="soft" color="gray" />
                    <Select.Content position="popper">
                        {/* Now strictly mapping to headers actually found in the content */}
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
                            // FIXED: Ref callback wrapped in braces to return void (Fixes ts(2322))
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