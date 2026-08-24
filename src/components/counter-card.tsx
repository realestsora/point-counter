import {
    useEffect,
    useRef,
    useState,
    type CSSProperties,
    type PointerEvent as ReactPointerEvent,
    type ReactNode,
    type TouchEvent as ReactTouchEvent
} from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Minus, MoreHorizontal, Plus } from "lucide-react";
import { AdjustAmountDialog } from "@/components/adjust-amount-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/hooks/use-i18n";
import type { CardDensity } from "@/lib/density";
import type { Counter } from "@/types";
import { cn } from "@/lib/utils";

const LONG_PRESS_MS = 400;
const MOVE_TOLERANCE = 10;

interface CounterCardProps {
    counter: Counter;
    density?: CardDensity;
    canReorder: boolean;
    onAdjust: (delta: number) => void;
    onEdit: () => void;
    onDelete: () => void;
    onReset: () => void;
}

function haptic(ms = 10) {
    try {
        navigator.vibrate?.(ms);
    } catch {}
}

function blockCardDrag(e: { stopPropagation: () => void }) {
    e.stopPropagation();
}

function cardGradient(color: string): CSSProperties {
    return {
        background: `linear-gradient(165deg, color-mix(in srgb, ${color} 92%, white) 0%, ${color} 48%, color-mix(in srgb, ${color} 88%, #1a1a1a) 100%)`
    };
}

export function CounterCard({
    counter,
    density = "comfortable",
    canReorder,
    onAdjust,
    onEdit,
    onDelete,
    onReset
}: CounterCardProps) {
    const { t } = useI18n();
    const [bump, setBump] = useState(false);
    const [customDir, setCustomDir] = useState<1 | -1 | null>(null);
    const prevScore = useRef(counter.score);
    const isGrid = density === "grid";
    const isCompact = density === "compact";

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: counter.id, disabled: !canReorder });

    useEffect(() => {
        if (prevScore.current === counter.score) return;
        prevScore.current = counter.score;
        setBump(true);
        const timer = window.setTimeout(() => setBump(false), 180);
        return () => window.clearTimeout(timer);
    }, [counter.score]);

    const adjust = (delta: number) => {
        haptic();
        onAdjust(delta);
    };

    const openCustom = (dir: 1 | -1) => {
        haptic(14);
        setCustomDir(dir);
    };

    const dragBind = canReorder ? { ...attributes, ...listeners } : {};

    const style: CSSProperties = {
        ...cardGradient(counter.color),
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined
    };

    return (
        <>
            <div
                ref={setNodeRef}
                style={style}
                className={cn(
                    "relative overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,0.18)]",
                    isGrid ? "rounded-[1.15rem]" : "rounded-[1.5rem]",
                    isDragging &&
                        "z-50 scale-[1.03] opacity-95 shadow-[0_18px_40px_rgba(0,0,0,0.35)] ring-2 ring-white/40"
                )}
            >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-[55%] bg-gradient-to-b from-white/22 to-transparent" />

                {/* Top-right menu — sits in reserved header strip, clear of ± */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className={cn(
                                "absolute z-20 flex items-center justify-center rounded-full bg-black/20 text-white/90 backdrop-blur-sm transition-colors hover:bg-black/30 hover:text-white",
                                isGrid
                                    ? "top-1 right-1 size-6"
                                    : "top-1.5 right-1.5 size-7"
                            )}
                            aria-label={t("options")}
                            onPointerDown={blockCardDrag}
                            onTouchStart={blockCardDrag}
                        >
                            <MoreHorizontal
                                className={isGrid ? "size-3" : "size-3.5"}
                            />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-40">
                        <DropdownMenuItem onClick={onEdit}>
                            {t("edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onReset}>
                            {t("resetScore")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            variant="destructive"
                            onClick={onDelete}
                        >
                            {t("delete")}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {isGrid ? (
                    <div className="relative flex h-full flex-col px-2.5 pt-7 pb-2.5">
                        <button
                            type="button"
                            className={cn(
                                "min-w-0 flex-1 select-none px-1 text-center text-white",
                                canReorder &&
                                    "cursor-grab touch-none active:cursor-grabbing"
                            )}
                            onClick={onEdit}
                            {...dragBind}
                        >
                            <div
                                className={cn(
                                    "truncate text-[2.2rem] leading-none font-bold tracking-tight tabular-nums drop-shadow-sm transition-transform duration-150",
                                    bump && "scale-110"
                                )}
                            >
                                {counter.score}
                            </div>
                            <div className="mt-1.5 flex items-center justify-center gap-1">
                                <span className="max-w-full truncate text-[0.78rem] font-semibold tracking-wide text-white">
                                    {counter.name}
                                </span>
                                {counter.step !== 1 && (
                                    <span className="rounded-full bg-white/20 px-1 py-px text-[9px] font-semibold text-white">
                                        ±{counter.step}
                                    </span>
                                )}
                            </div>
                        </button>

                        <div className="relative z-10 mt-2 flex items-center gap-2">
                            <AdjustButton
                                className="flex h-11 min-h-11 flex-1 items-center justify-center rounded-full bg-white text-neutral-900 shadow-[0_2px_8px_rgba(0,0,0,0.14)] transition-transform duration-100 active:scale-90"
                                label={t("decrease", { name: counter.name })}
                                title={t("holdForCustom")}
                                onTap={() => adjust(-counter.step)}
                                onLongPress={() => openCustom(-1)}
                            >
                                <Minus className="size-5" strokeWidth={2.6} />
                            </AdjustButton>
                            <AdjustButton
                                className="flex h-11 min-h-11 flex-1 items-center justify-center rounded-full bg-white text-neutral-900 shadow-[0_2px_8px_rgba(0,0,0,0.14)] transition-transform duration-100 active:scale-90"
                                label={t("increase", { name: counter.name })}
                                title={t("holdForCustom")}
                                onTap={() => adjust(counter.step)}
                                onLongPress={() => openCustom(1)}
                            >
                                <Plus className="size-5" strokeWidth={2.6} />
                            </AdjustButton>
                        </div>
                    </div>
                ) : (
                    /* Top strip keeps … clear of ± buttons */
                    <div
                        className={cn(
                            "relative flex items-center",
                            isCompact
                                ? "gap-2.5 px-3 pt-3.5 pb-2.5"
                                : "gap-3 px-3.5 py-[1.2rem] sm:gap-4 sm:px-5 sm:py-5"
                        )}
                    >
                        <AdjustButton
                            className={cn(
                                "relative z-10 flex shrink-0 items-center justify-center rounded-full bg-white text-neutral-900 shadow-[0_3px_12px_rgba(0,0,0,0.14)] transition-transform duration-100 active:scale-90",
                                isCompact
                                    ? "size-12"
                                    : "size-16 sm:size-[4.35rem]"
                            )}
                            label={t("decrease", { name: counter.name })}
                            title={t("holdForCustom")}
                            onTap={() => adjust(-counter.step)}
                            onLongPress={() => openCustom(-1)}
                        >
                            <Minus
                                className={
                                    isCompact ? "size-6" : "size-8 sm:size-9"
                                }
                                strokeWidth={2.6}
                            />
                        </AdjustButton>

                        <button
                            type="button"
                            className={cn(
                                "min-w-0 flex-1 select-none px-1 text-center text-white",
                                canReorder &&
                                    "cursor-grab touch-none active:cursor-grabbing"
                            )}
                            onClick={onEdit}
                            {...dragBind}
                        >
                            <div
                                className={cn(
                                    "truncate leading-none font-bold tracking-tight tabular-nums drop-shadow-sm transition-transform duration-150",
                                    isCompact
                                        ? "text-[2.25rem]"
                                        : "text-[3.05rem] sm:text-[3.45rem]",
                                    bump && "scale-110"
                                )}
                            >
                                {counter.score}
                            </div>
                            <div
                                className={cn(
                                    "flex items-center justify-center gap-1",
                                    isCompact ? "mt-1" : "mt-1.5"
                                )}
                            >
                                <span
                                    className={cn(
                                        "truncate font-semibold tracking-wide text-white",
                                        isCompact
                                            ? "max-w-[8rem] text-[0.85rem]"
                                            : "max-w-[10rem] text-[0.95rem] sm:max-w-[12rem] sm:text-base"
                                    )}
                                >
                                    {counter.name}
                                </span>
                                {counter.step !== 1 && (
                                    <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                                        ±{counter.step}
                                    </span>
                                )}
                            </div>
                        </button>

                        <AdjustButton
                            className={cn(
                                "relative z-10 flex shrink-0 items-center justify-center rounded-full bg-white text-neutral-900 shadow-[0_3px_12px_rgba(0,0,0,0.14)] transition-transform duration-100 active:scale-90",
                                isCompact
                                    ? "size-12"
                                    : "size-16 sm:size-[4.35rem]"
                            )}
                            label={t("increase", { name: counter.name })}
                            title={t("holdForCustom")}
                            onTap={() => adjust(counter.step)}
                            onLongPress={() => openCustom(1)}
                        >
                            <Plus
                                className={
                                    isCompact ? "size-6" : "size-8 sm:size-9"
                                }
                                strokeWidth={2.6}
                            />
                        </AdjustButton>
                    </div>
                )}
            </div>

            <AdjustAmountDialog
                open={customDir !== null}
                onOpenChange={(v) => !v && setCustomDir(null)}
                playerName={counter.name}
                color={counter.color}
                currentScore={counter.score}
                direction={customDir ?? 1}
                defaultAmount={counter.step}
                onConfirm={(delta) => {
                    haptic();
                    onAdjust(delta);
                    setCustomDir(null);
                }}
            />
        </>
    );
}

function AdjustButton({
    children,
    className,
    label,
    title,
    onTap,
    onLongPress
}: {
    children: ReactNode;
    className?: string;
    label: string;
    title?: string;
    onTap: () => void;
    onLongPress: () => void;
}) {
    const state = useRef({
        timer: null as number | null,
        pointerId: -1,
        startX: 0,
        startY: 0,
        long: false,
        moved: false
    });

    const clearTimer = () => {
        const s = state.current;
        if (s.timer != null) {
            window.clearTimeout(s.timer);
            s.timer = null;
        }
    };

    const onPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
        blockCardDrag(e);
        if (e.button !== 0) return;
        const s = state.current;
        s.pointerId = e.pointerId;
        s.startX = e.clientX;
        s.startY = e.clientY;
        s.long = false;
        s.moved = false;
        clearTimer();
        s.timer = window.setTimeout(() => {
            s.long = true;
            onLongPress();
        }, LONG_PRESS_MS);
    };

    const onTouchStart = (e: ReactTouchEvent<HTMLButtonElement>) => {
        blockCardDrag(e);
    };

    const onPointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
        const s = state.current;
        if (s.pointerId !== e.pointerId) return;
        if (
            Math.hypot(e.clientX - s.startX, e.clientY - s.startY) >
            MOVE_TOLERANCE
        ) {
            s.moved = true;
            clearTimer();
        }
    };

    const onPointerEnd = (e: ReactPointerEvent<HTMLButtonElement>) => {
        const s = state.current;
        if (s.pointerId !== e.pointerId && s.pointerId !== -1) return;
        const wasLong = s.long;
        const wasMoved = s.moved;
        clearTimer();
        s.pointerId = -1;
        if (!wasLong && !wasMoved) onTap();
        s.long = false;
        s.moved = false;
    };

    return (
        <button
            type="button"
            data-no-dnd
            className={cn("touch-none select-none", className)}
            aria-label={label}
            title={title}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerEnd}
            onPointerCancel={onPointerEnd}
            onTouchStart={onTouchStart}
            onContextMenu={(e) => e.preventDefault()}
        >
            {children}
        </button>
    );
}
