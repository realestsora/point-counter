import { createCounter, createGroup, uid } from "@/lib/storage";
import { clusterHistory, restoreCounters } from "@/lib/history";
import type { AppState, Counter, Group, HistoryEntry, SortMode } from "@/types";
import { MAX_HISTORY } from "@/types";

type HistoryDraft = Omit<HistoryEntry, "id" | "at">;

export function findGroup(state: AppState, groupId = state.activeGroupId) {
    return state.groups.find((g) => g.id === groupId);
}

export function findCounter(group: Group | undefined, counterId: string) {
    return group?.counters.find((c) => c.id === counterId);
}

export function mapGroup(
    state: AppState,
    groupId: string,
    fn: (group: Group) => Group
): Group[] {
    return state.groups.map((g) => (g.id === groupId ? fn(g) : g));
}

export function mapActiveGroup(state: AppState, fn: (group: Group) => Group) {
    return mapGroup(state, state.activeGroupId, fn);
}

export function sortCounters(counters: Counter[], mode: SortMode) {
    if (mode === "manual") return counters;
    const sorted = [...counters];
    sorted.sort((a, b) =>
        mode === "high" ? b.score - a.score : a.score - b.score
    );
    return sorted;
}

export function pushHistory(history: HistoryEntry[], draft: HistoryDraft) {
    return [{ ...draft, id: uid(), at: Date.now() }, ...history].slice(
        0,
        MAX_HISTORY
    );
}

function withHistory(
    state: AppState,
    draft: HistoryDraft,
    groups: Group[]
): AppState {
    return {
        ...state,
        groups,
        history: pushHistory(state.history, draft)
    };
}

export function addGroup(state: AppState, name: string): AppState {
    const group = createGroup(name || `Game ${Date.now() % 1000}`);
    return {
        ...state,
        groups: [...state.groups, group],
        activeGroupId: group.id
    };
}

export function renameGroup(
    state: AppState,
    id: string,
    name: string
): AppState {
    return {
        ...state,
        groups: mapGroup(state, id, (g) => ({ ...g, name }))
    };
}

export function deleteGroup(state: AppState, id: string): AppState {
    if (state.groups.length <= 1) return state;

    const groups = state.groups.filter((g) => g.id !== id);
    return {
        ...state,
        groups,
        activeGroupId:
            state.activeGroupId === id ? groups[0].id : state.activeGroupId,
        history: state.history.filter((h) => h.groupId !== id)
    };
}

export function addCounter(
    state: AppState,
    name: string,
    color: string,
    step = 1
): AppState {
    return {
        ...state,
        groups: mapActiveGroup(state, (g) => ({
            ...g,
            counters: [
                ...g.counters,
                createCounter(
                    name || `Player ${g.counters.length + 1}`,
                    color,
                    0,
                    step
                )
            ]
        }))
    };
}

export function updateCounter(
    state: AppState,
    id: string,
    patch: Partial<Counter>
): AppState {
    const group = findGroup(state);
    const counter = findCounter(group, id);
    if (!group || !counter) return state;

    const groups = mapActiveGroup(state, (g) => ({
        ...g,
        counters: g.counters.map((c) => (c.id === id ? { ...c, ...patch } : c))
    }));

    if (patch.score === undefined || patch.score === counter.score) {
        return { ...state, groups };
    }

    return withHistory(
        state,
        {
            groupId: group.id,
            kind: "set",
            counterId: counter.id,
            counterName: patch.name ?? counter.name,
            counterColor: patch.color ?? counter.color,
            counterStep: patch.step ?? counter.step,
            from: counter.score,
            to: patch.score,
            delta: patch.score - counter.score
        },
        groups
    );
}

export function adjustScore(
    state: AppState,
    id: string,
    delta: number
): AppState {
    if (delta === 0) return state;

    const group = findGroup(state);
    const counter = findCounter(group, id);
    if (!group || !counter) return state;

    const to = counter.score + delta;

    return withHistory(
        state,
        {
            groupId: group.id,
            kind: "adjust",
            counterId: counter.id,
            counterName: counter.name,
            counterColor: counter.color,
            counterStep: counter.step,
            from: counter.score,
            to,
            delta
        },
        mapActiveGroup(state, (g) => ({
            ...g,
            counters: g.counters.map((c) =>
                c.id === id ? { ...c, score: to } : c
            )
        }))
    );
}

export function deleteCounter(state: AppState, id: string): AppState {
    const group = findGroup(state);
    const index = group?.counters.findIndex((c) => c.id === id) ?? -1;
    const counter = index >= 0 ? group!.counters[index] : undefined;
    if (!group || !counter) return state;

    return withHistory(
        state,
        {
            groupId: group.id,
            kind: "delete",
            counterId: counter.id,
            counterName: counter.name,
            counterColor: counter.color,
            counterStep: counter.step,
            from: counter.score,
            to: counter.score,
            snapshot: { ...counter },
            index
        },
        mapActiveGroup(state, (g) => ({
            ...g,
            counters: g.counters.filter((c) => c.id !== id)
        }))
    );
}

export function resetScores(state: AppState): AppState {
    const group = findGroup(state);
    if (!group || group.counters.every((c) => c.score === 0)) return state;

    const scores: Record<string, number> = {};
    const labels: Record<string, string> = {};
    for (const c of group.counters) {
        scores[c.id] = c.score;
        labels[c.id] = c.name;
    }

    return withHistory(
        state,
        { groupId: group.id, kind: "reset-all", scores, labels },
        mapActiveGroup(state, (g) => ({
            ...g,
            counters: g.counters.map((c) => ({ ...c, score: 0 }))
        }))
    );
}

export function resetCounter(state: AppState, id: string): AppState {
    const group = findGroup(state);
    const counter = findCounter(group, id);
    if (!group || !counter || counter.score === 0) return state;

    return withHistory(
        state,
        {
            groupId: group.id,
            kind: "reset",
            counterId: counter.id,
            counterName: counter.name,
            counterColor: counter.color,
            counterStep: counter.step,
            from: counter.score,
            to: 0,
            delta: -counter.score
        },
        mapActiveGroup(state, (g) => ({
            ...g,
            counters: g.counters.map((c) =>
                c.id === id ? { ...c, score: 0 } : c
            )
        }))
    );
}

export function reorderCounters(
    state: AppState,
    orderedIds: string[]
): AppState {
    return {
        ...state,
        sortMode: "manual",
        groups: mapActiveGroup(state, (g) => {
            const byId = new Map(g.counters.map((c) => [c.id, c]));
            const ordered: Counter[] = [];
            for (const id of orderedIds) {
                const counter = byId.get(id);
                if (counter) {
                    ordered.push(counter);
                    byId.delete(id);
                }
            }
            return { ...g, counters: [...ordered, ...byId.values()] };
        })
    };
}

export function revertEntries(state: AppState, entryIds: string[]): AppState {
    if (!entryIds.length) return state;

    const idSet = new Set(entryIds);
    const selected = state.history.filter((h) => idSet.has(h.id));
    if (!selected.length) return state;

    const newestFirst =
        selected.length === 1
            ? selected
            : [...selected].sort((a, b) => b.at - a.at);

    const byGroup = new Map<string, HistoryEntry[]>();
    for (const entry of newestFirst) {
        const list = byGroup.get(entry.groupId);
        if (list) list.push(entry);
        else byGroup.set(entry.groupId, [entry]);
    }

    const groups = state.groups.map((group) => {
        const entries = byGroup.get(group.id);
        if (!entries) return group;

        let counters = group.counters;
        for (const entry of entries) {
            counters = restoreCounters(counters, entry);
        }
        return { ...group, counters };
    });

    return {
        ...state,
        groups,
        history: pruneHistory(
            state.history.filter((h) => !idSet.has(h.id)),
            groups
        )
    };
}

function pruneHistory(
    history: HistoryEntry[],
    groups: AppState["groups"]
): HistoryEntry[] {
    const livingByGroup = new Map(
        groups.map((g) => [g.id, new Set(g.counters.map((c) => c.id))])
    );

    return history.filter((h) => {
        if (h.kind !== "delete" || !h.counterId) return true;
        const living = livingByGroup.get(h.groupId);
        return !living?.has(h.counterId);
    });
}

export function undoLast(state: AppState): AppState {
    const groupEntries = state.history.filter(
        (h) => h.groupId === state.activeGroupId
    );
    if (!groupEntries.length) return state;

    const [latest] = clusterHistory(groupEntries);
    return revertEntries(
        state,
        latest.entries.map((e) => e.id)
    );
}

export function clearGroupHistory(state: AppState): AppState {
    return {
        ...state,
        history: state.history.filter((h) => h.groupId !== state.activeGroupId)
    };
}
