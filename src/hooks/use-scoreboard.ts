import { useCallback, useEffect, useMemo, useState } from "react";
import { loadState, saveState } from "@/lib/storage";
import * as sb from "@/lib/scoreboard";
import type { Counter, SortMode } from "@/types";

export function useScoreboard() {
    const [state, setState] = useState(loadState);

    useEffect(() => {
        saveState(state);
    }, [state]);

    const activeGroup = useMemo(
        () => sb.findGroup(state) ?? state.groups[0],
        [state]
    );

    const sortedCounters = useMemo(
        () => sb.sortCounters(activeGroup?.counters ?? [], state.sortMode),
        [activeGroup, state.sortMode]
    );

    const groupHistory = useMemo(
        () => state.history.filter((h) => h.groupId === state.activeGroupId),
        [state.history, state.activeGroupId]
    );

    const setActiveGroupId = useCallback((id: string) => {
        setState((prev) => ({ ...prev, activeGroupId: id }));
    }, []);

    const setSortMode = useCallback((sortMode: SortMode) => {
        setState((prev) => ({ ...prev, sortMode }));
    }, []);

    const setShowTotal = useCallback((showTotal: boolean) => {
        setState((prev) => ({ ...prev, showTotal }));
    }, []);

    const totalScore = useMemo(
        () =>
            (activeGroup?.counters ?? []).reduce(
                (sum, c) => sum + c.score,
                0
            ),
        [activeGroup]
    );

    const addGroup = useCallback((name: string) => {
        setState((prev) => sb.addGroup(prev, name));
    }, []);

    const renameGroup = useCallback((id: string, name: string) => {
        setState((prev) => sb.renameGroup(prev, id, name));
    }, []);

    const deleteGroup = useCallback((id: string) => {
        setState((prev) => sb.deleteGroup(prev, id));
    }, []);

    const duplicateGroup = useCallback((id: string, name: string) => {
        setState((prev) => sb.duplicateGroup(prev, id, name));
    }, []);

    const reorderGroups = useCallback((orderedIds: string[]) => {
        setState((prev) => sb.reorderGroups(prev, orderedIds));
    }, []);

    const addCounter = useCallback((name: string, color: string, step = 1) => {
        setState((prev) => sb.addCounter(prev, name, color, step));
    }, []);

    const updateCounter = useCallback((id: string, patch: Partial<Counter>) => {
        setState((prev) => sb.updateCounter(prev, id, patch));
    }, []);

    const adjustScore = useCallback((id: string, delta: number) => {
        setState((prev) => sb.adjustScore(prev, id, delta));
    }, []);

    const deleteCounter = useCallback((id: string) => {
        setState((prev) => sb.deleteCounter(prev, id));
    }, []);

    const resetScores = useCallback(() => {
        setState((prev) => sb.resetScores(prev));
    }, []);

    const resetCounter = useCallback((id: string) => {
        setState((prev) => sb.resetCounter(prev, id));
    }, []);

    const reorderCounters = useCallback((orderedIds: string[]) => {
        setState((prev) => sb.reorderCounters(prev, orderedIds));
    }, []);

    const revertEntry = useCallback((entryId: string) => {
        setState((prev) => sb.revertEntries(prev, [entryId]));
    }, []);

    const revertEntries = useCallback((entryIds: string[]) => {
        setState((prev) => sb.revertEntries(prev, entryIds));
    }, []);

    const undoLast = useCallback(() => {
        setState((prev) => sb.undoLast(prev));
    }, []);

    const clearHistory = useCallback(() => {
        setState((prev) => sb.clearGroupHistory(prev));
    }, []);

    return {
        groups: state.groups,
        activeGroup,
        sortMode: state.sortMode,
        showTotal: state.showTotal,
        totalScore,
        sortedCounters,
        groupHistory,
        canUndo: groupHistory.length > 0,
        setActiveGroupId,
        setSortMode,
        setShowTotal,
        addGroup,
        renameGroup,
        deleteGroup,
        duplicateGroup,
        reorderGroups,
        addCounter,
        updateCounter,
        adjustScore,
        deleteCounter,
        resetScores,
        resetCounter,
        reorderCounters,
        undoLast,
        revertEntry,
        revertEntries,
        clearHistory
    };
}
