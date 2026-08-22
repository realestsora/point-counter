export type SortMode = "manual" | "high" | "low";

export interface Counter {
    id: string;
    name: string;
    score: number;
    color: string;
    step: number;
}

export interface Group {
    id: string;
    name: string;
    counters: Counter[];
}

export type HistoryKind = "adjust" | "set" | "reset" | "reset-all";

export interface HistoryEntry {
    id: string;
    groupId: string;
    kind: HistoryKind;
    at: number;
    counterId?: string;
    counterName?: string;
    counterColor?: string;
    from?: number;
    to?: number;
    delta?: number;
    scores?: Record<string, number>;
    labels?: Record<string, string>;
}

export interface AppState {
    groups: Group[];
    activeGroupId: string;
    sortMode: SortMode;
    history: HistoryEntry[];
    showTotal: boolean;
}

export const COUNTER_COLORS = [
    "#FF5A5F",
    "#FF9F1A",
    "#3DDC84",
    "#3B9EFF",
    "#C77DFF",
    "#5ED4FF",
    "#FF5C8A",
    "#7B6CFF",
    "#4ECDC4",
    "#A0A8B8"
] as const;

export const MAX_HISTORY = 1000;

export const SORT_ORDER: SortMode[] = ["manual", "high", "low"];
