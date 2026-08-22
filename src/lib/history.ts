import type { Counter, HistoryEntry } from "@/types";
import { formatSigned } from "@/lib/format";

export interface HistoryCluster {
    id: string;
    entries: HistoryEntry[];
}

export interface ClusterSummary {
    totalDelta: number;
    from: number;
    to: number;
    steps: number;
    label: string;
}

export function clusterHistory(entries: HistoryEntry[]): HistoryCluster[] {
    const clusters: HistoryCluster[] = [];

    for (const entry of entries) {
        const last = clusters[clusters.length - 1];
        const tip = last?.entries[last.entries.length - 1];

        if (last && tip && isContinuousAdjust(tip, entry)) {
            last.entries.push(entry);
            continue;
        }

        clusters.push({ id: entry.id, entries: [entry] });
    }

    return clusters;
}

function isContinuousAdjust(newer: HistoryEntry, older: HistoryEntry) {
    if (newer.kind !== "adjust" || older.kind !== "adjust") return false;
    if (!newer.counterId || newer.counterId !== older.counterId) return false;
    if (newer.from !== older.to) return false;

    const a = newer.delta ?? 0;
    const b = older.delta ?? 0;
    return a !== 0 && b !== 0 && Math.sign(a) === Math.sign(b);
}

export function summarizeCluster(entries: HistoryEntry[]): ClusterSummary {
    const newest = entries[0];
    const oldest = entries[entries.length - 1];
    let totalDelta = 0;
    for (const e of entries) totalDelta += e.delta ?? 0;

    const from = oldest.from ?? 0;
    const to = newest.to ?? 0;

    return {
        totalDelta,
        from,
        to,
        steps: entries.length,
        label: `${formatSigned(totalDelta)}  ·  ${from} → ${to}`
    };
}

export function describeEntry(entry: HistoryEntry): string {
    switch (entry.kind) {
        case "reset-all":
            return `Reset all (${Object.keys(entry.scores ?? {}).length} players)`;
        case "reset":
            return `Reset ${entry.from} → 0`;
        case "set":
            return `Set ${entry.from} → ${entry.to}`;
        default:
            return `${formatSigned(entry.delta ?? 0)}  ·  ${entry.from} → ${entry.to}`;
    }
}

export function restoreCounters(
    counters: Counter[],
    entry: HistoryEntry
): Counter[] {
    if (entry.kind === "reset-all" && entry.scores) {
        const scores = entry.scores;
        return counters.map((c) =>
            scores[c.id] !== undefined ? { ...c, score: scores[c.id] } : c
        );
    }

    if (!entry.counterId || entry.from === undefined) return counters;

    const { counterId, from } = entry;
    return counters.map((c) =>
        c.id === counterId ? { ...c, score: from } : c
    );
}

export function entryTitle(entry: HistoryEntry) {
    return entry.kind === "reset-all"
        ? "Reset all"
        : (entry.counterName ?? "Player");
}

export function entryBadge(entry: HistoryEntry, totalDelta?: number) {
    if (entry.kind === "reset-all") return null;
    const value = totalDelta ?? entry.delta;
    if (value === undefined) return "·";
    return formatSigned(value);
}
