// src/pods/pods_temp/PodLog.tsx
import { Text, Box, Flex, RadioGroup, Popover, Button, TextField, Select } from "@radix-ui/themes";
import { MagnifyingGlassIcon, Cross2Icon } from "@radix-ui/react-icons";
import { useState, CSSProperties, useMemo, ReactNode, useEffect, useRef } from "react";

const FIXED_ROW_HEIGHT = "28px";
const GRID_LAYOUT = "140px 60px max-content";
const LOG_LEVELS = ["TRACE", "DEBUG", "INFO", "WARN", "ERROR", "FATAL"];

// Regex for ISO 8601 timestamps
const ISO_TIMESTAMP_REGEX = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?/;

const textStyle: CSSProperties = {
    fontSize: "12px",
    fontFamily: 'Menlo, Monaco, Consolas, monospace',
    lineHeight: FIXED_ROW_HEIGHT,
    whiteSpace: "nowrap",
    color: "var(--gray-12)",
};

const stickyColumnBase: CSSProperties = {
    position: "sticky",
    zIndex: 1,
};

const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export interface LogEntry {
    level: string;
    timeStamp: string;
    message: string;
    [key: string]: any;
}

export default function PodLog({ logs }: { logs: LogEntry[] | string }) {
    const [selectedField, setSelectedField] = useState<string>("message");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [minLevel, setMinLevel] = useState<string>("TRACE");
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = 0;
        }
    }, []);

    if (typeof logs === "string") {
        return <Box p="3" style={{ backgroundColor: '#fff' }}><Text size="1">{logs}</Text></Box>;
    }

    const logsArray = Array.isArray(logs) ? logs : (logs ? [logs] : []);

    /**
     * Extracts Level and Timestamp, then removes them from the remaining string
     */
    const parseAndCleanRawString = (str: string) => {
        let cleaned = str;

        // 1. Extract and remove Level [INFO]
        const levelMatch = str.match(/\[([A-Z]+)\]/);
        let level: string | null = null;
        if (levelMatch) {
            if (LOG_LEVELS.includes(levelMatch[1])) {
                level = levelMatch[1];
                cleaned = cleaned.replace(levelMatch[0], "");
            }
        }

        // 2. Extract and remove Timestamp
        const timeMatch = str.match(ISO_TIMESTAMP_REGEX);
        let time: string | null = null;
        if (timeMatch) {
            time = timeMatch[0];
            cleaned = cleaned.replace(timeMatch[0], "");
        }

        return {
            level,
            time,
            // Trim extra spaces left after removal
            cleanedMessage: cleaned.replace(/\s+/g, ' ').trim()
        };
    };

    const filteredLogs = useMemo(() => {
        const minLevelIndex = LOG_LEVELS.indexOf(minLevel);
        const lowerQuery = searchQuery.toLowerCase();

        return logsArray.filter((entry) => {
            let entryLevel: string | null = null;

            if (typeof entry === 'object' && entry !== null) {
                entryLevel = entry.level?.toUpperCase() || null;
            } else {
                entryLevel = parseAndCleanRawString(String(entry)).level;
            }

            if (entryLevel) {
                const entryLevelIndex = LOG_LEVELS.indexOf(entryLevel);
                if (entryLevelIndex !== -1 && entryLevelIndex < minLevelIndex) return false;
            } else if (minLevelIndex > 0) {
                return false;
            }

            if (!searchQuery) return true;
            const contentToSearch = typeof entry === 'object' && entry !== null
                ? String(entry[selectedField] ?? '')
                : String(entry);

            return contentToSearch.toLowerCase().includes(lowerQuery);
        });
    }, [logsArray, searchQuery, selectedField, minLevel]);

    const highlightText = (text: string, highlight: string): ReactNode => {
        if (!highlight.trim()) return text;
        try {
            const escaped = escapeRegExp(highlight);
            const parts = text.split(new RegExp(`(${escaped})`, "gi"));
            return (
                <span>
                    {parts.map((part, i) =>
                        part.toLowerCase() === highlight.toLowerCase() ? (
                            <mark key={i} style={{ backgroundColor: 'var(--yellow-3)', color: 'inherit', padding: '1px 0' }}>{part}</mark>
                        ) : (part)
                    )}
                </span>
            );
        } catch (e) { return text; }
    };

    const getLevelColor = (level: string | null) => {
        if (!level) return 'var(--gray-10)';
        if (level === 'ERROR' || level === 'FATAL') return 'var(--red-9)';
        if (level === 'WARN') return 'var(--orange-9)';
        return 'var(--blue-9)';
    };

    const formatShortTime = (ts: string | null) => ts ? ts.substring(0, 19).replace("T", " ") : "---";

    if (logsArray.length === 0) return <Box p="3"><Text size="1" color="gray">No logs available.</Text></Box>;

    const firstValidObject = logsArray.find(l => typeof l === 'object' && l !== null) as LogEntry | undefined;
    const selectableFields = firstValidObject
        ? Object.keys(firstValidObject).filter(k => k !== "timeStamp" && k !== "level")
        : ["message"];

    return (
        <Box style={{ backgroundColor: '#fff', border: '1px solid var(--gray-4)', borderRadius: '6px', overflow: 'hidden' }}>

            {/* TOOLBAR */}
            <Flex justify="between" align="center" p="2" gap="4" style={{ backgroundColor: 'var(--gray-2)', borderBottom: '1px solid var(--gray-5)' }}>
                <Flex align="center" gap="3" style={{ flexGrow: 1 }}>
                    <Text size="1" weight="bold" color="gray">{filteredLogs.length} / {logsArray.length}</Text>
                    <Select.Root value={minLevel} onValueChange={setMinLevel} size="1">
                        <Select.Trigger variant="soft" color="gray" />
                        <Select.Content position="popper">
                            {LOG_LEVELS.map(level => (
                                <Select.Item key={level} value={level}>{level}</Select.Item>
                            ))}
                        </Select.Content>
                    </Select.Root>
                    <Box style={{ width: '250px' }}>
                        <TextField.Root size="1" placeholder={`Search...`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}>
                            <TextField.Slot><MagnifyingGlassIcon height="14" width="14" /></TextField.Slot>
                            {searchQuery && (
                                <TextField.Slot side="right">
                                    <Button variant="ghost" size="1" onClick={() => setSearchQuery("")} style={{ cursor: 'pointer', padding: 0 }}>
                                        <Cross2Icon height="12" width="12" />
                                    </Button>
                                </TextField.Slot>
                            )}
                        </TextField.Root>
                    </Box>
                </Flex>
                <Popover.Root>
                    <Popover.Trigger><Button variant="ghost" size="1" color="blue">Column: {selectedField}</Button></Popover.Trigger>
                    <Popover.Content style={{ width: 220 }}>
                        <Text size="1" weight="bold" mb="2" style={{ display: 'block' }}>Display Field</Text>
                        <RadioGroup.Root value={selectedField} onValueChange={setSelectedField}>
                            {selectableFields.map(field => (
                                <Flex gap="2" key={field} align="center" mb="1">
                                    <RadioGroup.Item value={field} />
                                    <Text size="1" style={{ textTransform: 'capitalize' }}>{field}</Text>
                                </Flex>
                            ))}
                        </RadioGroup.Root>
                    </Popover.Content>
                </Popover.Root>
            </Flex>

            {/* TABLE CONTAINER */}
            <Box ref={scrollContainerRef} style={{ overflowX: 'auto' }}>
                <Box style={{ width: 'max-content', minWidth: '100%' }}>

                    {/* STICKY HEADER */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: GRID_LAYOUT, backgroundColor: '#fdfdfd', borderBottom: '2px solid var(--gray-6)', height: FIXED_ROW_HEIGHT, alignItems: 'center', position: 'sticky', top: 0, zIndex: 10
                    }}>
                        <Text size="1" weight="bold" color="blue" style={{ ...stickyColumnBase, left: 0, backgroundColor: '#fdfdfd', padding: '0 12px' }}>TIME</Text>
                        <Text size="1" weight="bold" color="blue" style={{ ...stickyColumnBase, left: '140px', backgroundColor: '#fdfdfd', padding: '0 12px' }}>LEVEL</Text>
                        <Text size="1" weight="bold" style={{ textTransform: 'uppercase', paddingLeft: '12px' }}>{selectedField}</Text>
                    </div>

                    {/* SCROLLABLE BODY */}
                    <Box style={{ maxHeight: '600px', overflowY: 'auto' }}>
                        {filteredLogs.map((entry, index) => {
                            const isObject = typeof entry === 'object' && entry !== null;
                            const rowBg = index % 2 === 0 ? '#fff' : '#f9f9f9';

                            let displayTime: string | null = null;
                            let displayLevel: string | null = null;
                            let displayMsg: string = "";

                            if (isObject) {
                                displayTime = entry.timeStamp;
                                displayLevel = entry.level?.toUpperCase();
                                displayMsg = typeof entry[selectedField] === 'object' ? JSON.stringify(entry[selectedField]) : String(entry[selectedField] ?? '---');
                            } else {
                                const parsed = parseAndCleanRawString(String(entry));
                                displayTime = parsed.time;
                                displayLevel = parsed.level;
                                displayMsg = parsed.cleanedMessage;
                            }

                            return (
                                <div key={index} style={{ display: 'grid', gridTemplateColumns: GRID_LAYOUT, borderBottom: '1px solid var(--gray-3)', backgroundColor: rowBg, height: FIXED_ROW_HEIGHT, alignItems: 'center' }}>
                                    <Text style={{ ...textStyle, ...stickyColumnBase, left: 0, backgroundColor: rowBg, padding: '0 12px' }}>
                                        {formatShortTime(displayTime)}
                                    </Text>
                                    <Text style={{ ...textStyle, ...stickyColumnBase, left: '140px', backgroundColor: rowBg, padding: '0 12px', fontWeight: 'bold', color: getLevelColor(displayLevel) }}>
                                        {displayLevel || '---'}
                                    </Text>
                                    <Text style={{ ...textStyle, paddingLeft: '12px' }} title={displayMsg}>
                                        {highlightText(displayMsg, searchQuery)}
                                    </Text>
                                </div>
                            );
                        })}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}