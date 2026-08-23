import { useEffect, useMemo, useState } from "react";
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    History,
    RotateCcw,
    Trash2,
    Undo2,
    UserMinus
} from "lucide-react";
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
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle
} from "@/components/ui/sheet";
import { UndoConfirm } from "@/components/undo-confirm";
import { useI18n } from "@/hooks/use-i18n";
import { formatTime } from "@/lib/format";
import {
    clusterHistory,
    displayCluster,
    previewUndo,
    type HistoryCluster,
    type UndoPreview
} from "@/lib/history";
import type { HistoryEntry } from "@/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

interface HistorySheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entries: HistoryEntry[];
    livingIds: ReadonlySet<string>;
    onRevert: (id: string) => void;
    onRevertMany: (ids: string[]) => void;
    onClear: () => void;
}

type PendingUndo =
    | { type: "one"; id: string; preview: UndoPreview }
    | { type: "many"; ids: string[]; preview: UndoPreview };

export function HistorySheet({
    open,
    onOpenChange,
    entries,
    livingIds,
    onRevert,
    onRevertMany,
    onClear
}: HistorySheetProps) {
    const { t } = useI18n();
    const [page, setPage] = useState(0);
    const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
    const [pendingUndo, setPendingUndo] = useState<PendingUndo | null>(null);
    const [clearOpen, setClearOpen] = useState(false);

    const clusters = useMemo(() => clusterHistory(entries), [entries]);
    const totalPages = Math.max(1, Math.ceil(clusters.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages - 1);
    const pageClusters = clusters.slice(
        safePage * PAGE_SIZE,
        safePage * PAGE_SIZE + PAGE_SIZE
    );

    useEffect(() => {
        if (!open) return;
        setPage(0);
        setExpanded(new Set());
        setPendingUndo(null);
        setClearOpen(false);
    }, [open]);

    useEffect(() => {
        setPage((p) => Math.min(p, totalPages - 1));
    }, [totalPages]);

    const toggle = (id: string) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const confirmUndo = () => {
        if (!pendingUndo) return;
        if (pendingUndo.type === "one") onRevert(pendingUndo.id);
        else onRevertMany(pendingUndo.ids);
        setPendingUndo(null);
    };

    return (
        <>
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent
                    side="bottom"
                    className="mx-auto flex max-h-[88vh] max-w-md flex-col gap-0 rounded-t-3xl border-white/12 bg-[#222228] p-0"
                >
                    <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-white/15" />

                    <SheetHeader className="shrink-0 gap-1 px-5 pt-4 pb-3 text-left">
                        <div className="flex items-center justify-between gap-3">
                            <SheetTitle className="flex items-center gap-2 text-lg">
                                <History className="size-5 text-[#5ED4FF]" />
                                {t("scoreHistory")}
                            </SheetTitle>
                            {entries.length > 0 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 text-white/45 hover:text-white"
                                    onClick={() => setClearOpen(true)}
                                >
                                    <Trash2 className="size-3.5" />
                                    {t("clear")}
                                </Button>
                            )}
                        </div>
                        <SheetDescription className="text-white/40">
                            {t("historyHint")}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="relative min-h-0 flex-1">
                        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-6 bg-gradient-to-b from-[#222228] to-transparent" />
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-6 bg-gradient-to-t from-[#222228] to-transparent" />

                        <div className="history-scroll h-full max-h-[min(52vh,440px)] overflow-y-auto overscroll-contain px-4">
                            {clusters.length === 0 ? (
                                <EmptyState />
                            ) : (
                                <ul className="space-y-2 py-2 pb-4">
                                    {pageClusters.map((cluster, index) => (
                                        <ClusterRow
                                            key={cluster.id}
                                            cluster={cluster}
                                            livingIds={livingIds}
                                            isLatest={
                                                safePage === 0 && index === 0
                                            }
                                            expanded={expanded.has(cluster.id)}
                                            onToggle={() => toggle(cluster.id)}
                                            onRequestUndo={(pending) =>
                                                setPendingUndo(pending)
                                            }
                                        />
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {clusters.length > PAGE_SIZE && (
                        <div className="flex shrink-0 items-center justify-between gap-2 border-t border-white/[0.08] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-9 rounded-full px-3 text-white/70"
                                disabled={safePage <= 0}
                                onClick={() =>
                                    setPage((p) => Math.max(0, p - 1))
                                }
                            >
                                <ChevronLeft className="size-4" />
                                {t("prev")}
                            </Button>
                            <p className="text-xs tabular-nums text-white/45">
                                {t("pageOf", {
                                    page: safePage + 1,
                                    total: totalPages
                                })}
                                <span className="text-white/25">
                                    {" "}
                                    ·{" "}
                                    {t("groupsCount", { n: clusters.length })}
                                </span>
                            </p>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-9 rounded-full px-3 text-white/70"
                                disabled={safePage >= totalPages - 1}
                                onClick={() =>
                                    setPage((p) =>
                                        Math.min(totalPages - 1, p + 1)
                                    )
                                }
                            >
                                {t("next")}
                                <ChevronRight className="size-4" />
                            </Button>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            <UndoConfirm
                open={Boolean(pendingUndo)}
                onOpenChange={(v) => !v && setPendingUndo(null)}
                preview={pendingUndo?.preview ?? null}
                onConfirm={confirmUndo}
            />

            <AlertDialog open={clearOpen} onOpenChange={setClearOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t("clearHistoryTitle")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("clearHistoryDesc")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            onClick={() => {
                                onClear();
                                setClearOpen(false);
                            }}
                        >
                            {t("clear")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

function EmptyState() {
    const { t } = useI18n();
    return (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-white/[0.05]">
                <History className="size-6 text-white/25" />
            </div>
            <p className="text-sm text-white/40">{t("noScoreChanges")}</p>
        </div>
    );
}

function ClusterRow({
    cluster,
    livingIds,
    isLatest,
    expanded,
    onToggle,
    onRequestUndo
}: {
    cluster: HistoryCluster;
    livingIds: ReadonlySet<string>;
    isLatest: boolean;
    expanded: boolean;
    onToggle: () => void;
    onRequestUndo: (pending: PendingUndo) => void;
}) {
    const { t, locale } = useI18n();
    const isChain = cluster.entries.length > 1;
    const first = cluster.entries[0];
    const view = displayCluster(cluster.entries, locale);
    const preview = previewUndo(cluster.entries, livingIds, locale);

    const meta = [
        view.range,
        view.steps > 1 ? t("taps", { n: view.steps }) : null,
        formatTime(view.at, locale),
        isLatest ? t("latest") : null
    ]
        .filter(Boolean)
        .join(" · ");

    return (
        <li className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03]">
            <div className="flex items-center gap-2 p-3">
                <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    onClick={isChain ? onToggle : undefined}
                    disabled={!isChain}
                >
                    <div
                        className={cn(
                            "flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                            view.kind === "reset-all"
                                ? "bg-white/10 text-white/60"
                                : "text-white"
                        )}
                        style={
                            view.color
                                ? { backgroundColor: view.color }
                                : undefined
                        }
                    >
                        {view.kind === "reset-all" ? (
                            <RotateCcw className="size-4" />
                        ) : view.kind === "delete" ? (
                            <UserMinus className="size-4" />
                        ) : (
                            view.badge
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                            <p className="truncate text-sm font-semibold">
                                {view.title}
                            </p>
                            {isChain && (
                                <ChevronDown
                                    className={cn(
                                        "size-3.5 shrink-0 text-white/40 transition-transform",
                                        expanded && "rotate-180"
                                    )}
                                />
                            )}
                        </div>
                        <p className="truncate text-xs text-white/40">{meta}</p>
                    </div>
                </button>

                <Button
                    type="button"
                    size="sm"
                    className="h-9 shrink-0 rounded-full bg-white/10 px-3 text-white hover:bg-white/15"
                    onClick={() => {
                        if (!preview) return;
                        if (isChain) {
                            onRequestUndo({
                                type: "many",
                                ids: cluster.entries.map((e) => e.id),
                                preview
                            });
                        } else {
                            onRequestUndo({
                                type: "one",
                                id: first.id,
                                preview
                            });
                        }
                    }}
                >
                    <Undo2 className="size-3.5" />
                    {t("undo")}
                </Button>
            </div>

            {isChain && expanded && (
                <ul className="history-scroll max-h-48 space-y-1 overflow-y-auto border-t border-white/[0.06] bg-black/20 px-3 py-2">
                    {[...cluster.entries].reverse().map((entry, stepIdx) => {
                        const stepView = displayCluster([entry], locale);
                        const stepPreview = previewUndo(
                            [entry],
                            livingIds,
                            locale
                        );
                        return (
                            <li
                                key={entry.id}
                                className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-xs"
                            >
                                <span className="w-5 shrink-0 text-center tabular-nums text-white/30">
                                    {stepIdx + 1}
                                </span>
                                <span className="min-w-0 flex-1 tabular-nums text-white/75">
                                    {stepView.range}
                                    {stepView.badge && (
                                        <span className="text-white/35">
                                            {" "}
                                            · {stepView.badge}
                                        </span>
                                    )}
                                </span>
                                <span className="shrink-0 text-white/30">
                                    {formatTime(stepView.at, locale)}
                                </span>
                                <button
                                    type="button"
                                    className="shrink-0 rounded-full px-2 py-1 text-white/50 hover:bg-white/10 hover:text-white"
                                    onClick={() => {
                                        if (!stepPreview) return;
                                        onRequestUndo({
                                            type: "one",
                                            id: entry.id,
                                            preview: stepPreview
                                        });
                                    }}
                                    title={t("undoThisStep")}
                                    aria-label={t("undoThisStep")}
                                >
                                    <Undo2 className="size-3" />
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </li>
    );
}
