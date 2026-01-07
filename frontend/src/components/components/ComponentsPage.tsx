// src/components/components/ComponentsPage.tsx

import { Flex, Heading, Spinner, Text, CheckboxGroup, Popover, Button, Badge } from "@radix-ui/themes";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";
import { useEffect, useState, useMemo } from "react";
import { fetchComponentStatus, fetchComponentDescribe, fetchComponentDescribeSections } from "../../api/component";
import { ComponentsSummaryCard } from "./ComponentsSummaryCard";

type Props = {
    fileName: string;
    component: string;
};

export default function ComponentsPage({ fileName, component }: Props) {
    const [resourceMap, setResourceMap] = useState<Record<string, any>>({});
    const [describeMap, setDescribeMap] = useState<Record<string, any>>({});
    const [describeHeaderMap, setDescribeHeaderMap] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);

    // Default columns often shared across K8s resources
    const [visibleColumns, setVisibleColumns] = useState<string[]>(["READY", "STATUS", "AGE", "IP"]);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        fetchComponentStatus(fileName, component)
            .then((data) => {
                if (isMounted) {
                    setResourceMap(data || {});
                    setLoading(false);
                }
            })
            .catch((err) => {
                console.error(`Failed to fetch ${component} status:`, err);
                if (isMounted) setLoading(false);
            });

        fetchComponentDescribe(fileName, component)
            .then((data) => {
                if (isMounted) {
                    setDescribeMap(data || {});
                    setLoading(false);
                }
            })
            .catch((err) => {
                console.error(`Failed to fetch ${component} describe:`, err);
                if (isMounted) setLoading(false);
            });

        fetchComponentDescribeSections(fileName, component)
            .then((data) => {
                if (isMounted) {
                    setDescribeHeaderMap(data || {});
                    setLoading(false);
                }
            })
            .catch((err) => {
                console.error(`Failed to fetch ${component} describe header:`, err);
                if (isMounted) setLoading(false);
            });

        return () => { isMounted = false; };
    }, [fileName, component]);

    const resourceEntries = Object.entries(resourceMap);

    // Dynamically discover all unique keys available for this specific component type
    const allAvailableColumns = useMemo(() => {
        const keys = new Set<string>();
        resourceEntries.forEach(([_, details]) => {
            Object.keys(details).forEach(k => keys.add(k));
        });
        // We filter out STATUS because it's usually the color stripe on the left
        return Array.from(keys).filter(k => k.toUpperCase() !== "STATUS");
    }, [resourceMap]);

    if (loading) return <Flex justify="center" p="9"><Spinner size="3" /></Flex>;

    return (
        <Flex direction="column" gap="4" p="4">
            <Flex justify="between" align="center">
                <Heading size="5" style={{ textTransform: 'capitalize' }}>
                    {component} Overview
                </Heading>

                {/* --- GENERIC COLUMN PICKER --- */}
                <Popover.Root>
                    <Popover.Trigger>
                        <Button variant="soft" color="gray" size="2">
                            {/* Use a simple text symbol if icons are giving you trouble */}
                            <MixerHorizontalIcon />
                            Columns
                            <Badge variant="solid" radius="full" size="1">
                                {visibleColumns.filter(c => allAvailableColumns.includes(c)).length}
                            </Badge>
                        </Button>
                    </Popover.Trigger>
                    <Popover.Content style={{ width: 220 }}>
                        <Text size="1" weight="bold" mb="2" as="div">Toggle Columns</Text>
                        <CheckboxGroup.Root
                            value={visibleColumns}
                            onValueChange={setVisibleColumns}
                        >
                            <Flex direction="column" gap="2">
                                {allAvailableColumns.map(col => (
                                    <CheckboxGroup.Item key={col} value={col}>
                                        <Text size="1">{col}</Text>
                                    </CheckboxGroup.Item>
                                ))}
                            </Flex>
                        </CheckboxGroup.Root>
                    </Popover.Content>
                </Popover.Root>
            </Flex>

            {resourceEntries.length > 0 ? (
                <Flex direction="column" gap="2">
                    {resourceEntries.map(([name, details]) => (
                        <ComponentsSummaryCard
                            key={name}
                            componentName={name} // Renamed for generic use
                            details={details}
                            fileName={fileName}
                            component={component}
                            visibleColumns={visibleColumns}
                            describeMap={describeMap}
                            describeHeaderMap={describeHeaderMap}
                        />
                    ))}
                </Flex>
            ) : (
                <Flex align="center" justify="center" p="9" style={{ border: '1px dashed var(--gray-6)', borderRadius: 'var(--radius-3)' }}>
                    <Text color="gray">No {component} data found in {fileName.split('/').pop()}</Text>
                </Flex>
            )}
        </Flex>
    );
}