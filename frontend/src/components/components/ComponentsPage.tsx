// src/components/components/ComponentsPage.tsx

import {
    Flex, Heading, Spinner, Text, CheckboxGroup, Popover,
    Button, Badge, TextField, Select, IconButton
} from "@radix-ui/themes";
import {
    MixerHorizontalIcon, MagnifyingGlassIcon,
    ArrowUpIcon, ArrowDownIcon, Cross1Icon,
} from "@radix-ui/react-icons";
import { useEffect, useState, useMemo } from "react";
import { fetchComponentStatus, fetchComponentDescribe, fetchComponentDescribeSections } from "../../api/component";
import { ComponentsSummaryCard } from "./ComponentsSummaryCard";
import ErrorBoundary from "../../common/ErrorBoundary";

type Props = {
    fileName: string;
    component: string;
};

type SortConfig = {
    key: string;
    direction: 'asc' | 'desc';
} | null;

export default function ComponentsPage({ fileName, component }: Props) {
    const [resourceMap, setResourceMap] = useState<Record<string, any>>({});
    const [describeMap, setDescribeMap] = useState<Record<string, any>>({});

    // Split loading states
    const [loadingStatus, setLoadingStatus] = useState(true);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const [visibleColumns, setVisibleColumns] = useState<string[]>(["READY", "STATUS", "AGE", "IP"]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);

    // --- PHASE 1: Load Status (Fast Path) ---
    useEffect(() => {
        let isMounted = true;
        setLoadingStatus(true);
        // Reset maps when fileName or component changes to prevent showing old data
        setResourceMap({});
        setDescribeMap({});

        const loadStatus = async () => {
            try {
                const status = await fetchComponentStatus(fileName, component);
                if (isMounted) {
                    setResourceMap(status || {});
                    setLoadingStatus(false); // Render the list now!

                    // --- PHASE 2: Background Fetch (Only if status exists) ---
                    if (status && Object.keys(status).length > 0) {
                        loadBackgroundDetails();
                    }
                }
            } catch (err) {
                console.error(`Failed to fetch ${component} status:`, err);
                if (isMounted) setLoadingStatus(false);
            }
        };

        const loadBackgroundDetails = async () => {
            if (!isMounted) return;
            setLoadingDetails(true);
            try {
                const [describe] = await Promise.all([
                    fetchComponentDescribe(fileName, component),
                ]);
                if (isMounted) {
                    setDescribeMap(describe || {});
                }
            } catch (err) {
                console.error(`Background hydration failed:`, err);
            } finally {
                if (isMounted) setLoadingDetails(false);
            }
        };

        loadStatus();
        return () => { isMounted = false; };
    }, [fileName, component]);

    // --- Logic: Memoized Entries, Sort, Filter ---
    const resourceEntries = useMemo(() => Object.entries(resourceMap), [resourceMap]);

    const allAvailableColumns = useMemo(() => {
        const keys = new Set<string>();
        resourceEntries.forEach(([_, details]) => {
            Object.keys(details).forEach(k => keys.add(k));
        });
        return Array.from(keys);
    }, [resourceEntries]);

    const processedEntries = useMemo(() => {
        let items = [...resourceEntries];
        if (searchTerm) {
            items = items.filter(([name]) =>
                name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (sortConfig) {
            items.sort(([nameA, detailsA], [nameB, detailsB]) => {
                let valA = sortConfig.key === "NAME" ? nameA : detailsA[sortConfig.key];
                let valB = sortConfig.key === "NAME" ? nameB : detailsB[sortConfig.key];
                valA = valA?.toString().toLowerCase() || "";
                valB = valB?.toString().toLowerCase() || "";
                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return items;
    }, [resourceEntries, searchTerm, sortConfig]);

    const toggleSortDirection = () => {
        if (!sortConfig) return;
        setSortConfig({ ...sortConfig, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' });
    };

    // Global loading only for initial list
    if (loadingStatus) return <Flex justify="center" p="9"><Spinner size="3" /></Flex>;

    return (
        <Flex direction="column" gap="4" p="4">
            <Flex justify="between" align="center">
                <Flex align="center" gap="3">
                    <Heading size="5" style={{ textTransform: 'capitalize' }}>
                        {component} Overview
                    </Heading>
                    {/* Background loader indicator */}
                    {loadingDetails && (
                        <Flex align="center" gap="2">
                            <Spinner size="1" />
                            <Text size="1" color="gray">Loading descibe...</Text>
                        </Flex>
                    )}
                </Flex>

                <Flex gap="3" align="center">
                    <TextField.Root
                        placeholder="Search name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        size="2"
                    >
                        <TextField.Slot><MagnifyingGlassIcon height="16" width="16" /></TextField.Slot>
                        {searchTerm && (
                            <TextField.Slot>
                                <IconButton variant="ghost" size="1" onClick={() => setSearchTerm("")}>
                                    <Cross1Icon />
                                </IconButton>
                            </TextField.Slot>
                        )}
                    </TextField.Root>

                    <Flex align="center" gap="1">
                        <Select.Root
                            value={sortConfig?.key || ""}
                            onValueChange={(val) => setSortConfig({ key: val, direction: 'asc' })}
                        >
                            <Select.Trigger placeholder="Sort by..." variant="soft" color="gray" />
                            <Select.Content>
                                <Select.Item value="NAME">NAME</Select.Item>
                                {allAvailableColumns.map(col => (
                                    <Select.Item key={col} value={col}>{col}</Select.Item>
                                ))}
                            </Select.Content>
                        </Select.Root>
                        {sortConfig && (
                            <IconButton variant="ghost" onClick={toggleSortDirection}>
                                {sortConfig.direction === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />}
                            </IconButton>
                        )}
                    </Flex>

                    <Popover.Root>
                        <Popover.Trigger>
                            <Button variant="soft" color="gray" size="2">
                                <MixerHorizontalIcon /> Columns
                                <Badge variant="solid" radius="full" size="1">
                                    {visibleColumns.filter(c => allAvailableColumns.includes(c)).length}
                                </Badge>
                            </Button>
                        </Popover.Trigger>
                        <Popover.Content style={{ width: 220 }}>
                            <Text size="1" weight="bold" mb="2" as="div">Toggle Columns</Text>
                            <CheckboxGroup.Root value={visibleColumns} onValueChange={setVisibleColumns}>
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
            </Flex>

            {processedEntries.length > 0 ? (
                <Flex direction="column" gap="2">
                    {processedEntries.map(([name, details]) => (
                        <ErrorBoundary key={name}>
                            <ComponentsSummaryCard
                                componentName={name}
                                details={details}
                                fileName={fileName}
                                component={component}
                                visibleColumns={visibleColumns}
                                describeMap={describeMap}
                            />
                        </ErrorBoundary>
                    ))}
                </Flex>
            ) : (
                <Flex align="center" justify="center" p="9" style={{ border: '1px dashed var(--gray-6)', borderRadius: 'var(--radius-3)' }}>
                    <Text color="gray">
                        {searchTerm ? "No results match your search" : `No ${component} data found`}
                    </Text>
                </Flex>
            )}
        </Flex>
    );
}