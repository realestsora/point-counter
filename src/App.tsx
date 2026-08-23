import { useMemo, useState, type ReactNode } from "react";
import {
    closestCenter,
    DndContext,
    type DragEndEvent,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import {
    arrayMove,
    rectSortingStrategy,
    SortableContext,
    verticalListSortingStrategy
} from "@dnd-kit/sortable";
import {
    ArrowDownNarrowWide,
    ArrowUpNarrowWide,
    History,
    ListFilter,
    MoreHorizontal,
    Pencil,
    Plus,
    RotateCcw,
    Trash2,
    Undo2
} from "lucide-react";
import { CounterCard } from "@/components/counter-card";
import { CounterDialog } from "@/components/counter-dialog";
import { GroupDialog } from "@/components/group-dialog";
import { HistorySheet } from "@/components/history-sheet";
import { UndoConfirm } from "@/components/undo-confirm";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useI18n } from "@/hooks/use-i18n";
import { useScoreboard } from "@/hooks/use-scoreboard";
import { getCardDensity } from "@/lib/density";
import { playerCountLabel } from "@/lib/format";
import { latestUndoPreview } from "@/lib/history";
import type { Locale } from "@/lib/i18n";
import type { Counter, SortMode } from "@/types";
import { SORT_ORDER } from "@/types";
import { cn } from "@/lib/utils";

const SORT_ICONS = {
    manual: ListFilter,
    high: ArrowDownNarrowWide,
    low: ArrowUpNarrowWide
} as const;

export default function App() {
    const { t, locale, setLocale } = useI18n();
    const board = useScoreboard();
    const {
        groups,
        activeGroup,
        sortMode,
        showTotal,
        totalScore,
        sortedCounters,
        groupHistory,
        canUndo
    } = board;

    const [counterDialogOpen, setCounterDialogOpen] = useState(false);
    const [editingCounter, setEditingCounter] = useState<Counter | null>(null);
    const [groupDialogOpen, setGroupDialogOpen] = useState(false);
    const [renamingGroup, setRenamingGroup] = useState(false);
    const [resetOpen, setResetOpen] = useState(false);
    const [deleteGroupOpen, setDeleteGroupOpen] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [undoOpen, setUndoOpen] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<Counter | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 120, tolerance: 10 }
        })
    );

    const ids = useMemo(
        () => sortedCounters.map((c) => c.id),
        [sortedCounters]
    );
    const usedColors = useMemo(
        () => activeGroup?.counters.map((c) => c.color) ?? [],
        [activeGroup]
    );
    const density = getCardDensity(sortedCounters.length);
    const canReorder = sortMode === "manual";
    const SortIcon = SORT_ICONS[sortMode];
    const sortStrategy =
        density === "grid"
            ? rectSortingStrategy
            : verticalListSortingStrategy;
    const livingIds = useMemo(
        () => new Set(sortedCounters.map((c) => c.id)),
        [sortedCounters]
    );
    const undoPreview = useMemo(
        () => latestUndoPreview(groupHistory, livingIds, locale),
        [groupHistory, livingIds, locale]
    );

    const sortLabel = (mode: SortMode) => {
        if (mode === "manual") return t("sortManual");
        if (mode === "high") return t("sortHigh");
        return t("sortLow");
    };

    const sortShort = (mode: SortMode) => {
        if (mode === "manual") return t("sortManualShort");
        if (mode === "high") return t("sortHigh");
        return t("sortLow");
    };

    const openAddCounter = () => {
        setEditingCounter(null);
        setCounterDialogOpen(true);
    };

    const openEditCounter = (counter: Counter) => {
        setEditingCounter(counter);
        setCounterDialogOpen(true);
    };

    const cycleSort = () => {
        const i = SORT_ORDER.indexOf(sortMode);
        board.setSortMode(SORT_ORDER[(i + 1) % SORT_ORDER.length]);
    };

    const onDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = ids.indexOf(String(active.id));
        const newIndex = ids.indexOf(String(over.id));
        if (oldIndex < 0 || newIndex < 0) return;

        board.reorderCounters(arrayMove(ids, oldIndex, newIndex));
    };

    const subtitle = [
        playerCountLabel(sortedCounters.length, locale),
        sortMode !== "manual" ? sortShort(sortMode) : null,
        canReorder && sortedCounters.length > 1 ? t("dragToReorder") : null
    ]
        .filter(Boolean)
        .join(" · ");

    return (
        <div className="mx-auto flex min-h-svh w-full max-w-md flex-1 flex-col bg-[#16161a] text-white">
            <header className="sticky top-0 z-20 border-b border-white/[0.08] bg-[#16161a]/90 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
                <div className="flex items-center gap-2 px-4 py-3.5">
                    <div className="min-w-0 flex-1">
                        <h1 className="truncate text-[1.75rem] leading-none font-bold tracking-tight">
                            {activeGroup?.name ?? t("scoreboard")}
                        </h1>
                        <p className="mt-1 text-xs text-white/50">{subtitle}</p>
                    </div>

                    <div className="flex shrink-0 items-center gap-0.5">
                        <IconBtn
                            label={t("undo")}
                            disabled={!canUndo}
                            onClick={() => setUndoOpen(true)}
                            className={cn(!canUndo && "opacity-25")}
                        >
                            <Undo2
                                className="size-[1.15rem]"
                                strokeWidth={2.25}
                            />
                        </IconBtn>

                        <IconBtn
                            label={t("history")}
                            onClick={() => setHistoryOpen(true)}
                            className="relative"
                        >
                            <History
                                className="size-[1.15rem]"
                                strokeWidth={2.25}
                            />
                            {groupHistory.length > 0 && (
                                <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-[#5ED4FF] ring-2 ring-[#16161a]" />
                            )}
                        </IconBtn>

                        <IconBtn
                            label={`${t("sort")}: ${sortLabel(sortMode)}`}
                            onClick={cycleSort}
                            className={cn(
                                sortMode !== "manual" &&
                                    "bg-white/10 text-white"
                            )}
                        >
                            <SortIcon
                                className="size-[1.15rem]"
                                strokeWidth={2.25}
                            />
                        </IconBtn>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    className="flex size-10 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                                    aria-label={t("menu")}
                                >
                                    <MoreHorizontal
                                        className="size-5"
                                        strokeWidth={2.25}
                                    />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="min-w-52"
                            >
                                <DropdownMenuItem
                                    onClick={() => {
                                        setRenamingGroup(true);
                                        setGroupDialogOpen(true);
                                    }}
                                >
                                    <Pencil className="size-4" />
                                    {t("renameGroup")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        setRenamingGroup(false);
                                        setGroupDialogOpen(true);
                                    }}
                                >
                                    <Plus className="size-4" />
                                    {t("newGroup")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setResetOpen(true)}
                                >
                                    <RotateCcw className="size-4" />
                                    {t("resetAllScores")}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuCheckboxItem
                                    checked={showTotal}
                                    onCheckedChange={(checked) =>
                                        board.setShowTotal(checked === true)
                                    }
                                >
                                    {t("showTotalScore")}
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>
                                    {t("sort")}
                                </DropdownMenuLabel>
                                <DropdownMenuRadioGroup
                                    value={sortMode}
                                    onValueChange={(v) =>
                                        board.setSortMode(v as SortMode)
                                    }
                                >
                                    <DropdownMenuRadioItem value="manual">
                                        {t("sortManual")}
                                    </DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="high">
                                        {t("sortHigh")}
                                    </DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="low">
                                        {t("sortLow")}
                                    </DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>
                                    {t("language")}
                                </DropdownMenuLabel>
                                <DropdownMenuRadioGroup
                                    value={locale}
                                    onValueChange={(v) =>
                                        setLocale(v as Locale)
                                    }
                                >
                                    <DropdownMenuRadioItem value="en">
                                        {t("langEn")}
                                    </DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="vi">
                                        {t("langVi")}
                                    </DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    variant="destructive"
                                    disabled={groups.length <= 1}
                                    onClick={() => setDeleteGroupOpen(true)}
                                >
                                    <Trash2 className="size-4" />
                                    {t("deleteGroup")}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {groups.length > 1 && (
                    <ScrollArea className="w-full whitespace-nowrap">
                        <div className="flex gap-2 px-4 pb-3.5">
                            {groups.map((group) => {
                                const active = group.id === activeGroup?.id;
                                return (
                                    <button
                                        key={group.id}
                                        type="button"
                                        onClick={() =>
                                            board.setActiveGroupId(group.id)
                                        }
                                        className={cn(
                                            "rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-all",
                                            active
                                                ? "bg-white text-black shadow-sm"
                                                : "bg-white/[0.12] text-white/70 hover:bg-white/[0.16] hover:text-white"
                                        )}
                                    >
                                        {group.name}
                                        <span
                                            className={cn(
                                                "ml-1.5 tabular-nums",
                                                active
                                                    ? "text-black/45"
                                                    : "text-white/45"
                                            )}
                                        >
                                            {group.counters.length}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                        <ScrollBar
                            orientation="horizontal"
                            className="invisible"
                        />
                    </ScrollArea>
                )}

                {showTotal && sortedCounters.length > 0 && (
                    <div className="mx-4 mb-3 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#5ED4FF]/12 via-white/[0.04] to-white/[0.04] px-3.5 py-2.5 ring-1 ring-[#5ED4FF]/20">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#5ED4FF]/15 text-[#5ED4FF]">
                            <span className="text-xs font-bold">Σ</span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-medium tracking-wide text-white/45">
                                {t("combinedScore")}
                            </p>
                            <p className="truncate text-xs text-white/30">
                                {playerCountLabel(
                                    sortedCounters.length,
                                    locale
                                )}
                            </p>
                        </div>
                        <p className="shrink-0 text-2xl leading-none font-bold tabular-nums tracking-tight text-[#5ED4FF]">
                            {totalScore}
                        </p>
                    </div>
                )}
            </header>

            <main className="flex-1 px-3.5 pt-3 pb-3 sm:px-4">
                {sortedCounters.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-4 px-6 py-28 text-center">
                        <div className="flex size-16 items-center justify-center rounded-full bg-white/[0.1]">
                            <Plus className="size-7 text-white/55" />
                        </div>
                        <div>
                            <p className="font-medium text-white/85">
                                {t("noPlayersYet")}
                            </p>
                            <p className="mt-1 text-sm text-white/45">
                                {t("addPlayerToStart")}
                            </p>
                        </div>
                        <Button
                            type="button"
                            className="mt-1 h-11 rounded-full bg-[#5ED4FF] px-6 font-semibold text-black hover:bg-[#5ED4FF]/90"
                            onClick={openAddCounter}
                        >
                            <Plus className="size-4" />
                            {t("addPlayer")}
                        </Button>
                    </div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={onDragEnd}
                    >
                        <SortableContext items={ids} strategy={sortStrategy}>
                            <div
                                className={cn(
                                    density === "grid" &&
                                        "grid grid-cols-2 gap-2.5",
                                    density === "compact" && "space-y-2",
                                    density === "comfortable" && "space-y-3"
                                )}
                            >
                                {sortedCounters.map((counter) => (
                                    <CounterCard
                                        key={counter.id}
                                        counter={counter}
                                        density={density}
                                        canReorder={canReorder}
                                        onAdjust={(delta) =>
                                            board.adjustScore(
                                                counter.id,
                                                delta
                                            )
                                        }
                                        onEdit={() => openEditCounter(counter)}
                                        onDelete={() =>
                                            setPendingDelete(counter)
                                        }
                                        onReset={() =>
                                            board.resetCounter(counter.id)
                                        }
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </main>

            <footer className="mt-auto shrink-0 px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                <div className="flex h-[3.75rem] items-end justify-between gap-3">
                    <p className="pb-0.5 text-[11px] leading-none tracking-wide text-white/30">
                        {t("madeBy")}{" "}
                        <span className="text-[#FF5C8A]" aria-hidden>
                            ♥
                        </span>
                    </p>
                    <div className="size-[3.75rem] shrink-0" aria-hidden />
                </div>
            </footer>

            <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 mx-auto flex max-w-md justify-end p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                <button
                    type="button"
                    onClick={openAddCounter}
                    className="pointer-events-auto flex size-[3.75rem] items-center justify-center rounded-full bg-[#5ED4FF] text-[#0b1b24] shadow-[0_10px_28px_rgba(94,212,255,0.45)] transition-transform active:scale-90"
                    aria-label={t("addPlayer")}
                >
                    <Plus className="size-8" strokeWidth={2.5} />
                </button>
            </div>

            <CounterDialog
                open={counterDialogOpen}
                onOpenChange={setCounterDialogOpen}
                counter={editingCounter}
                defaultName={t("playerN", {
                    n: (activeGroup?.counters.length ?? 0) + 1
                })}
                usedColors={usedColors}
                onSave={(data) => {
                    if (editingCounter) {
                        board.updateCounter(editingCounter.id, {
                            name: data.name,
                            color: data.color,
                            step: data.step,
                            score: data.score ?? editingCounter.score
                        });
                    } else {
                        board.addCounter(data.name, data.color, data.step);
                    }
                }}
            />

            <GroupDialog
                open={groupDialogOpen}
                onOpenChange={setGroupDialogOpen}
                title={renamingGroup ? t("renameGroup") : t("newGroup")}
                initialName={renamingGroup ? (activeGroup?.name ?? "") : ""}
                onSave={(name) => {
                    if (renamingGroup && activeGroup)
                        board.renameGroup(activeGroup.id, name);
                    else board.addGroup(name);
                }}
            />

            <HistorySheet
                open={historyOpen}
                onOpenChange={setHistoryOpen}
                entries={groupHistory}
                livingIds={livingIds}
                onRevert={board.revertEntry}
                onRevertMany={board.revertEntries}
                onClear={board.clearHistory}
            />

            <UndoConfirm
                open={undoOpen}
                onOpenChange={setUndoOpen}
                preview={undoPreview}
                onConfirm={() => {
                    board.undoLast();
                    setUndoOpen(false);
                }}
            />

            <AlertDialog
                open={Boolean(pendingDelete)}
                onOpenChange={(v) => !v && setPendingDelete(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t("deletePlayerTitle")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("deletePlayerDesc", {
                                name: pendingDelete?.name ?? ""
                            })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            onClick={() => {
                                if (pendingDelete)
                                    board.deleteCounter(pendingDelete.id);
                                setPendingDelete(null);
                            }}
                        >
                            {t("delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t("resetAllTitle")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("resetAllDesc", {
                                name: activeGroup?.name ?? ""
                            })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction onClick={board.resetScores}>
                            {t("reset")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                open={deleteGroupOpen}
                onOpenChange={setDeleteGroupOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t("deleteGroupTitle")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("deleteGroupDesc", {
                                name: activeGroup?.name ?? ""
                            })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            onClick={() =>
                                activeGroup && board.deleteGroup(activeGroup.id)
                            }
                        >
                            {t("delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function IconBtn({
    children,
    label,
    onClick,
    disabled,
    className
}: {
    children: ReactNode;
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
}) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            aria-label={label}
            title={label}
            className={cn(
                "flex size-10 items-center justify-center rounded-full text-white/75 transition-colors",
                "hover:bg-white/10 hover:text-white disabled:pointer-events-none",
                className
            )}
        >
            {children}
        </button>
    );
}
