import {
    useEffect,
    useRef,
    useState,
    type CSSProperties,
    type PointerEvent as ReactPointerEvent
} from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Minus, MoreHorizontal, Plus } from "lucide-react";
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

interface CounterCardProps {
    counter: Counter;
    density?: CardDensity;
    canReorder: boolean;
    onAdjust: (delta: number) => void;
    onEdit: () => void;
    onDelete: () => void;
    onReset: () => void;
}

function haptic() {
    try {
        navigator.vibrate?.(10);
    } catch {}
}

function stopDrag(e: ReactPointerEvent) {
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

    const style: CSSProperties = {
        ...cardGradient(counter.color),
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "relative overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,0.18)]",
                isGrid ? "rounded-[1.15rem]" : "rounded-[1.5rem]",
                canReorder && "cursor-grab active:cursor-grabbing",
                isDragging &&
                    "z-50 scale-[1.03] cursor-grabbing opacity-95 shadow-[0_18px_40px_rgba(0,0,0,0.35)] ring-2 ring-white/40"
            )}
            {...(canReorder ? { ...attributes, ...listeners } : {})}
        >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[55%] bg-gradient-to-b from-white/22 to-transparent" />

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        className={cn(
                            "absolute z-10 flex items-center justify-center rounded-full bg-black/15 text-white/90 backdrop-blur-sm transition-colors hover:bg-black/25 hover:text-white",
                            isGrid
                                ? "top-1 right-1 size-6"
                                : "top-1.5 right-1.5 size-7"
                        )}
                        aria-label={t("options")}
                        onPointerDown={stopDrag}
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
                    <DropdownMenuItem variant="destructive" onClick={onDelete}>
                        {t("delete")}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {isGrid ? (
                <div className="relative flex h-full flex-col px-2.5 pt-3.5 pb-2.5">
                    <button
                        type="button"
                        className="min-w-0 flex-1 select-none px-1 text-center text-white"
                        onClick={onEdit}
                        onPointerDown={stopDrag}
                    >
                        <div
                            className={cn(
                                "truncate text-[2.35rem] leading-none font-bold tracking-tight tabular-nums drop-shadow-sm transition-transform duration-150",
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

                    <div className="mt-2 flex items-center justify-between gap-2">
                        <button
                            type="button"
                            className="flex size-11 flex-1 items-center justify-center rounded-full bg-white text-neutral-900 shadow-[0_2px_8px_rgba(0,0,0,0.14)] transition-transform duration-100 active:scale-90"
                            onClick={() => adjust(-counter.step)}
                            onPointerDown={stopDrag}
                            aria-label={t("decrease", { name: counter.name })}
                        >
                            <Minus className="size-5" strokeWidth={2.6} />
                        </button>
                        <button
                            type="button"
                            className="flex size-11 flex-1 items-center justify-center rounded-full bg-white text-neutral-900 shadow-[0_2px_8px_rgba(0,0,0,0.14)] transition-transform duration-100 active:scale-90"
                            onClick={() => adjust(counter.step)}
                            onPointerDown={stopDrag}
                            aria-label={t("increase", { name: counter.name })}
                        >
                            <Plus className="size-5" strokeWidth={2.6} />
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    className={cn(
                        "relative flex items-center",
                        isCompact
                            ? "gap-2.5 px-3 py-2.5"
                            : "gap-3 px-3.5 py-[1.2rem] sm:gap-4 sm:px-5 sm:py-5"
                    )}
                >
                    <button
                        type="button"
                        className={cn(
                            "flex shrink-0 items-center justify-center rounded-full bg-white text-neutral-900 shadow-[0_3px_12px_rgba(0,0,0,0.14)] transition-transform duration-100 active:scale-90",
                            isCompact
                                ? "size-12"
                                : "size-16 sm:size-[4.35rem]"
                        )}
                        onClick={() => adjust(-counter.step)}
                        onPointerDown={stopDrag}
                        aria-label={t("decrease", { name: counter.name })}
                    >
                        <Minus
                            className={
                                isCompact ? "size-6" : "size-8 sm:size-9"
                            }
                            strokeWidth={2.6}
                        />
                    </button>

                    <button
                        type="button"
                        className="min-w-0 flex-1 select-none text-center text-white"
                        onClick={onEdit}
                        onPointerDown={stopDrag}
                    >
                        <div
                            className={cn(
                                "truncate leading-none font-bold tracking-tight tabular-nums drop-shadow-sm transition-transform duration-150",
                                isCompact
                                    ? "text-[2.35rem]"
                                    : "text-[3.15rem] sm:text-[3.55rem]",
                                bump && "scale-110"
                            )}
                        >
                            {counter.score}
                        </div>
                        <div
                            className={cn(
                                "flex items-center justify-center gap-1",
                                isCompact ? "mt-1" : "mt-2"
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

                    <button
                        type="button"
                        className={cn(
                            "flex shrink-0 items-center justify-center rounded-full bg-white text-neutral-900 shadow-[0_3px_12px_rgba(0,0,0,0.14)] transition-transform duration-100 active:scale-90",
                            isCompact
                                ? "size-12"
                                : "size-16 sm:size-[4.35rem]"
                        )}
                        onClick={() => adjust(counter.step)}
                        onPointerDown={stopDrag}
                        aria-label={t("increase", { name: counter.name })}
                    >
                        <Plus
                            className={
                                isCompact ? "size-6" : "size-8 sm:size-9"
                            }
                            strokeWidth={2.6}
                        />
                    </button>
                </div>
            )}
        </div>
    );
}
