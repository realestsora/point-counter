import type { Counter, HistoryEntry, HistoryKind } from "@/types";
import { COUNTER_COLORS } from "@/types";
import { formatSigned } from "@/lib/format";
import { t, type Locale } from "@/lib/i18n";

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

export interface HistoryDisplay {
    title: string;
    range: string;
    badge: string | null;
    steps: number;
    at: number;
    color?: string;
    kind: HistoryKind;
}

export interface UndoPreview {
    title: string;
    subject: string;
    currentScore: string;
    restoredScore: string;
    rangeLabel: string;
    explanation: string;
    steps: number;
    deltaLabel: string | null;
    color?: string;
    willRestorePlayer?: boolean;
}

export const CLUSTER_GAP_MS = 5000;

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
    if (Math.abs(newer.at - older.at) > CLUSTER_GAP_MS) return false;

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

export function displayCluster(
    entries: HistoryEntry[],
    locale: Locale = "en"
): HistoryDisplay {
    const first = entries[0];
    const title = entryTitle(first, locale);
    const kind = first.kind;
    const at = first.at;
    const color = first.counterColor;
    const steps = entries.length;

    if (kind === "reset-all") {
        const n = Object.keys(first.scores ?? {}).length;
        return {
            title,
            range:
                n === 1
                    ? t(locale, "playersToZero_one")
                    : t(locale, "playersToZero_other", { n }),
            badge: null,
            steps: 1,
            at,
            color,
            kind
        };
    }

    if (kind === "delete") {
        return {
            title,
            range: t(locale, "removedScore", { score: first.from ?? 0 }),
            badge: "⌫",
            steps: 1,
            at,
            color,
            kind
        };
    }

    if (steps === 1) {
        const entry = first;
        if (kind === "reset") {
            return {
                title,
                range: `${entry.from} → 0`,
                badge: formatSigned(-(entry.from ?? 0)),
                steps: 1,
                at,
                color,
                kind
            };
        }
        return {
            title,
            range: `${entry.from} → ${entry.to}`,
            badge:
                entry.delta !== undefined ? formatSigned(entry.delta) : "·",
            steps: 1,
            at,
            color,
            kind
        };
    }

    const summary = summarizeCluster(entries);
    return {
        title,
        range: `${summary.from} → ${summary.to}`,
        badge: formatSigned(summary.totalDelta),
        steps: summary.steps,
        at,
        color,
        kind
    };
}

function counterFromEntry(
    entry: HistoryEntry,
    score: number,
    locale: Locale = "en"
): Counter | null {
    if (entry.snapshot) {
        return { ...entry.snapshot, score };
    }
    if (!entry.counterId) return null;

    return {
        id: entry.counterId,
        name: entry.counterName ?? t(locale, "player"),
        color: entry.counterColor ?? COUNTER_COLORS[0],
        step: Math.max(1, entry.counterStep ?? 1),
        score
    };
}

function insertCounter(
    counters: Counter[],
    counter: Counter,
    index?: number
): Counter[] {
    if (counters.some((c) => c.id === counter.id)) {
        return counters.map((c) =>
            c.id === counter.id ? { ...c, ...counter } : c
        );
    }
    const next = [...counters];
    const at = Math.min(Math.max(index ?? next.length, 0), next.length);
    next.splice(at, 0, counter);
    return next;
}

export function restoreCounters(
    counters: Counter[],
    entry: HistoryEntry
): Counter[] {
    if (entry.kind === "delete") {
        const restored = counterFromEntry(
            entry,
            entry.snapshot?.score ?? entry.from ?? 0
        );
        if (!restored) return counters;
        return insertCounter(counters, restored, entry.index);
    }

    if (entry.kind === "reset-all" && entry.scores) {
        const scores = entry.scores;
        return counters.map((c) =>
            scores[c.id] !== undefined ? { ...c, score: scores[c.id] } : c
        );
    }

    if (!entry.counterId || entry.from === undefined) return counters;

    const existing = counters.find((c) => c.id === entry.counterId);
    if (existing) {
        return counters.map((c) =>
            c.id === entry.counterId ? { ...c, score: entry.from! } : c
        );
    }

    const restored = counterFromEntry(entry, entry.from);
    if (!restored) return counters;
    return insertCounter(counters, restored, entry.index);
}

export function entryTitle(entry: HistoryEntry, locale: Locale = "en") {
    if (entry.kind === "reset-all") return t(locale, "resetAll");
    return entry.counterName ?? t(locale, "player");
}

function isPlayerMissing(
    entries: HistoryEntry[],
    livingIds?: ReadonlySet<string>
) {
    if (!livingIds) return false;
    const id = entries[0]?.counterId;
    if (!id) return false;
    return !livingIds.has(id);
}

export function previewUndo(
    entries: HistoryEntry[],
    livingIds?: ReadonlySet<string>,
    locale: Locale = "en"
): UndoPreview | null {
    if (!entries.length) return null;

    const display = displayCluster(entries, locale);
    const first = entries[0];
    const subject = display.title;
    const missing = isPlayerMissing(entries, livingIds);
    const removed = t(locale, "removed");
    const previous = t(locale, "previous");

    if (first.kind === "reset-all") {
        const n = Object.keys(first.scores ?? {}).length;
        return {
            title: t(locale, "undoResetAllTitle"),
            subject,
            currentScore: "0",
            restoredScore: previous,
            rangeLabel: `0 → ${previous}`,
            explanation: t(locale, "undoResetAllExpl", { n }),
            steps: 1,
            deltaLabel: null,
            color: first.counterColor
        };
    }

    if (first.kind === "delete") {
        const score = first.snapshot?.score ?? first.from ?? 0;
        return {
            title: t(locale, "restorePlayerTitle", { name: subject }),
            subject,
            currentScore: removed,
            restoredScore: String(score),
            rangeLabel: `${removed} → ${score}`,
            explanation: t(locale, "restorePlayerExpl", {
                name: subject,
                score
            }),
            steps: 1,
            deltaLabel: null,
            color: first.counterColor,
            willRestorePlayer: true
        };
    }

    const restoreNote = missing
        ? t(locale, "restoreNote", { name: subject })
        : "";

    if (entries.length === 1) {
        const entry = first;
        const current = missing ? removed : String(entry.to ?? 0);
        const restored = String(entry.from ?? 0);
        const delta =
            entry.delta !== undefined ? formatSigned(entry.delta) : null;

        let explanation = t(locale, "undoRestoreExpl", {
            name: subject,
            from: entry.to ?? 0,
            to: restored
        });
        if (entry.kind === "reset") {
            explanation = t(locale, "undoResetExpl", {
                name: subject,
                to: restored
            });
        } else if (entry.kind === "set") {
            explanation = t(locale, "undoSetExpl", { name: subject });
        } else if (delta) {
            explanation = t(locale, "undoAdjustExpl", {
                name: subject,
                delta
            });
        }
        explanation += restoreNote;

        return {
            title: missing
                ? t(locale, "restoreUndoPlayerTitle", { name: subject })
                : t(locale, "undoPlayerTitle", { name: subject }),
            subject,
            currentScore: current,
            restoredScore: restored,
            rangeLabel: `${current} → ${restored}`,
            explanation,
            steps: 1,
            deltaLabel: delta,
            color: entry.counterColor,
            willRestorePlayer: missing
        };
    }

    const summary = summarizeCluster(entries);
    const current = missing ? removed : String(summary.to);
    const restored = String(summary.from);
    const delta = formatSigned(summary.totalDelta);

    return {
        title: missing
            ? t(locale, "restoreUndoPlayerTitle", { name: subject })
            : t(locale, "undoPlayerTitle", { name: subject }),
        subject,
        currentScore: current,
        restoredScore: restored,
        rangeLabel: `${current} → ${restored}`,
        explanation:
            t(locale, "undoClusterExpl", {
                steps: summary.steps,
                name: subject,
                delta,
                to: restored
            }) + restoreNote,
        steps: summary.steps,
        deltaLabel: delta,
        color: first.counterColor,
        willRestorePlayer: missing
    };
}

export function latestUndoPreview(
    entries: HistoryEntry[],
    livingIds?: ReadonlySet<string>,
    locale: Locale = "en"
): UndoPreview | null {
    const clusters = clusterHistory(entries);
    if (!clusters.length) return null;
    return previewUndo(clusters[0].entries, livingIds, locale);
}
