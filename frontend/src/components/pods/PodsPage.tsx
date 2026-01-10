// src/pods/pods/PodsPage.tsx

import {
    Flex, Heading, Spinner, Text, CheckboxGroup, Popover,
    Button, Badge, TextField, Select, IconButton, Box
} from "@radix-ui/themes";

import {
    MixerHorizontalIcon,
    MagnifyingGlassIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    Cross1Icon,
} from "@radix-ui/react-icons";

import { useEffect, useState, useMemo } from "react";
import { fetchComponentStatus, fetchComponentDescribe } from "../../api/component";
import { fetchPodContainers } from "../../api/pods";
import { PodsSummaryCard } from "./PodsSummaryCard";
import ErrorBoundary from "../../common/ErrorBoundary";

type Props = {
    fileName: string;
    component: string;
};

type SortConfig = {
    key: string;
    direction: 'asc' | 'desc';
} | null;

export default function PodsPage({ fileName, component }: Props) {
    const [resourceMap, setResourceMap] = useState<Record<string, any>>({});
    const [describeMap, setDescribeMap] = useState<Record<string, any>>({});
    const [podContainerMap, setPodContainerMap] = useState<Record<string, any>>({});
    const [loadingStatus, setLoadingStatus] = useState(true);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // --- State for View/Filter/Sort ---
    const [visibleColumns, setVisibleColumns] = useState<string[]>(["READY", "STATUS", "AGE", "IP"]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);
    const [activeStatusFilter, setActiveStatusFilter] = useState<string>("All");

    useEffect(() => {
        let isMounted = true;

        setLoadingStatus(true);
        setResourceMap({});
        setDescribeMap({});
        setPodContainerMap({});

        const loadBackgroundDetails = async () => {
            if (!isMounted) return;
            setLoadingDetails(true);

            try {
                const [describe, containers] = await Promise.all([
                    fetchComponentDescribe(fileName, component),
                    fetchPodContainers(fileName)
                ]);

                if (isMounted) {
                    setDescribeMap(describe || {});
                    setPodContainerMap(containers || {});
                }
            } catch (err) {
                console.error(`Background hydration failed:`, err);
            } finally {
                if (isMounted) setLoadingDetails(false);
            }
        };

        const loadStatus = async () => {
            try {
                const status = await fetchComponentStatus(fileName, component);

                if (isMounted) {
                    setResourceMap(status || {});
                    setLoadingStatus(false);

                    if (status && Object.keys(status).length > 0) {
                        loadBackgroundDetails();
                    }
                }
            } catch (err) {
                console.error(`Failed to fetch ${component} status:`, err);
                if (isMounted) setLoadingStatus(false);
            }
        };

        loadStatus();

        return () => {
            isMounted = false;
        };
    }, [fileName, component]);

    const resourceEntries = Object.entries(resourceMap);

    // --- Compute Status Counts for the Filter Bar ---
    const statusCounts = useMemo(() => {
        const counts: Record<string, number> = { "All": resourceEntries.length };
        resourceEntries.forEach(([_, details]) => {
            const status = details.STATUS || "Unknown";
            counts[status] = (counts[status] || 0) + 1;
        });
        return counts;
    }, [resourceEntries]);

    // Get all possible keys for the column picker
    const allAvailableColumns = useMemo(() => {
        const keys = new Set<string>();
        resourceEntries.forEach(([_, details]) => {
            Object.keys(details).forEach(k => keys.add(k));
        });
        return Array.from(keys);
    }, [resourceMap]);

    // --- Core Logic: Sort and Filter ---
    const processedEntries = useMemo(() => {
        let items = [...resourceEntries];

        // 1. Status Filter
        if (activeStatusFilter !== "All") {
            items = items.filter(([_, details]) => details.STATUS === activeStatusFilter);
        }

        // 2. Search Filter (by Resource Name)
        if (searchTerm) {
            items = items.filter(([name]) =>
                name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // 3. Sorting
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
    }, [resourceEntries, searchTerm, sortConfig, activeStatusFilter]);

    const toggleSortDirection = () => {
        if (!sortConfig) return;
        setSortConfig({
            ...sortConfig,
            direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
        });
    };

    const getStatusBadgeColor = (status: string): "green" | "orange" | "red" | "gray" => {
        const s = status.toLowerCase();
        if (s === 'running' || s === 'completed') return 'green';
        if (s === 'pending' || s === 'containercreating') return 'orange';
        if (s === 'error' || s === 'crashloopbackoff' || s === 'failed') return 'red';
        return 'gray';
    };

    if (loadingStatus) return <Flex justify="center" p="9"><Spinner size="3" /></Flex>;

    return (
        <Flex direction="column" gap="4" p="4">
            {/* --- HEADER SECTION --- */}
            <Flex justify="between" align="end">
                <Flex direction="column" gap="2">
                    <Flex align="center" gap="3">
                        <Heading size="5" style={{ textTransform: 'capitalize' }}>
                            Pods Overview
                        </Heading>
                        {loadingDetails && (
                            <Flex align="center" gap="2">
                                <Spinner size="1" />
                                <Text size="1" color="gray">Loading details...</Text>
                            </Flex>
                        )}
                    </Flex>

                    <TextField.Root
                        placeholder="Search name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        size="2"
                        style={{ width: '320px' }}
                    >
                        <TextField.Slot>
                            <MagnifyingGlassIcon height="16" width="16" />
                        </TextField.Slot>
                        {searchTerm && (
                            <TextField.Slot>
                                <IconButton variant="ghost" size="1" onClick={() => setSearchTerm("")}>
                                    <Cross1Icon />
                                </IconButton>
                            </TextField.Slot>
                        )}
                    </TextField.Root>
                </Flex>

                <Flex direction="column" align="end" gap="3">
                    {/* --- TOOLS (Sort & Columns) --- */}
                    <Flex gap="3" align="center">
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

                    {/* --- STATUS FILTER BAR --- */}
                    <Flex gap="3" align="center" style={{ padding: '4px', borderRadius: 'var(--radius-2)' }}>
                        {Object.entries(statusCounts).map(([status, count]) => {
                            const isActive = activeStatusFilter === status;
                            const statusColor = status === "All" ? "gray" : getStatusBadgeColor(status);

                            return (
                                <Button
                                    key={status}
                                    variant={isActive ? "solid" : "ghost"}
                                    color={statusColor}
                                    size="1"
                                    style={{ cursor: 'pointer', borderRadius: 'var(--radius-1)' }}
                                    onClick={() => setActiveStatusFilter(status)}
                                >
                                    <Text size="1" weight={isActive ? "bold" : "regular"}>{status}</Text>
                                    <Badge
                                        variant={isActive ? "soft" : "outline"}
                                        color={statusColor}
                                        ml="1"
                                        size="1"
                                    >
                                        {count}
                                    </Badge>
                                </Button>
                            );
                        })}
                    </Flex>
                </Flex>
            </Flex>

            {/* --- RESULTS SECTION --- */}
            {processedEntries.length > 0 ? (
                <Flex direction="column" gap="2">
                    {processedEntries.map(([name, details]) => (
                        <ErrorBoundary key={name}>
                            <PodsSummaryCard
                                podName={name}
                                details={details}
                                fileName={fileName}
                                component={component}
                                visibleColumns={visibleColumns}
                                describeMap={describeMap}
                                podContainerMap={podContainerMap}
                            />
                        </ErrorBoundary>
                    ))}
                </Flex>
            ) : (
                <Flex align="center" justify="center" p="9" style={{ border: '1px dashed var(--gray-6)', borderRadius: 'var(--radius-3)' }}>
                    <Text color="gray">
                        {searchTerm || activeStatusFilter !== "All" ? "No results match your search criteria" : `No ${component} data found`}
                    </Text>
                </Flex>
            )}
        </Flex>
    );
}