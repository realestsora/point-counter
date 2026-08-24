import { v4 as uuidv4 } from "uuid";
import type { AppState, Counter, Group } from "@/types";
import { COUNTER_COLORS } from "@/types";

const STORAGE_KEY = "point-counter-state";

export function uid() {
    return uuidv4();
}

export function pickColor(used: readonly string[] = []) {
    const taken = new Set(used);
    const free = COUNTER_COLORS.filter((c) => !taken.has(c));
    const pool = free.length > 0 ? free : COUNTER_COLORS;
    return pool[Math.floor(Math.random() * pool.length)];
}

export function createCounter(
    name = "Player",
    color?: string,
    score = 0,
    step = 1
): Counter {
    return {
        id: uid(),
        name,
        score,
        color: color ?? pickColor(),
        step: Math.max(1, step)
    };
}

export function createGroup(name = "New game"): Group {
    return { id: uid(), name, counters: [] };
}

export function defaultState(): AppState {
    const group: Group = {
        id: uid(),
        name: "UNO",
        counters: [
            createCounter("Red", COUNTER_COLORS[0]),
            createCounter("Orange", COUNTER_COLORS[1]),
            createCounter("Green", COUNTER_COLORS[2]),
            createCounter("Blue", COUNTER_COLORS[3])
        ]
    };

    return {
        groups: [group],
        activeGroupId: group.id,
        sortMode: "manual",
        history: [],
        showTotal: false
    };
}

function normalize(state: AppState): AppState {
    if (!state.groups?.length) return defaultState();

    const activeGroupId = state.groups.some((g) => g.id === state.activeGroupId)
        ? state.activeGroupId
        : state.groups[0].id;

    return {
        ...state,
        activeGroupId,
        history: Array.isArray(state.history) ? state.history : [],
        sortMode: state.sortMode ?? "manual",
        showTotal: Boolean(state.showTotal)
    };
}

export function loadState(): AppState {
    try {
        let raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return defaultState();
        return normalize(JSON.parse(raw) as AppState);
    } catch {
        return defaultState();
    }
}

export function saveState(state: AppState) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    ...state,
                    history: state.history.slice(
                        0,
                        Math.floor(state.history.length * 0.7)
                    )
                })
            );
        } catch {}
    }
}
