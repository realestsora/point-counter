import { useCallback, useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const FAB_SIZE = 60;
const FAB_PAD = 20;
const LONG_PRESS_MS = 380;
const MOVE_TOLERANCE = 10;
const STORAGE_KEY = "point-counter-fab-pos";

type FabPos = { nx: number; ny: number };

function loadPos(): FabPos | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const p = JSON.parse(raw) as FabPos;
        if (
            typeof p.nx === "number" &&
            typeof p.ny === "number" &&
            Number.isFinite(p.nx) &&
            Number.isFinite(p.ny)
        ) {
            return {
                nx: Math.min(1, Math.max(0, p.nx)),
                ny: Math.min(1, Math.max(0, p.ny))
            };
        }
    } catch {}
    return null;
}

function savePos(pos: FabPos) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
    } catch {}
}

function defaultPos(areaW: number, _areaH = 0) {
    const maxX = Math.max(0, areaW - FAB_SIZE - FAB_PAD * 2);
    return {
        x: FAB_PAD + maxX,
        y: FAB_PAD
    };
}

function fromNorm(n: FabPos, areaW: number, areaH: number) {
    const maxX = Math.max(0, areaW - FAB_SIZE - FAB_PAD * 2);
    const maxY = Math.max(0, areaH - FAB_SIZE - FAB_PAD * 2);
    return {
        x: FAB_PAD + n.nx * maxX,
        y: FAB_PAD + n.ny * maxY
    };
}

function toNorm(x: number, y: number, areaW: number, areaH: number): FabPos {
    const maxX = Math.max(0, areaW - FAB_SIZE - FAB_PAD * 2);
    const maxY = Math.max(0, areaH - FAB_SIZE - FAB_PAD * 2);
    return {
        nx: maxX <= 0 ? 1 : Math.min(1, Math.max(0, (x - FAB_PAD) / maxX)),
        ny: maxY <= 0 ? 0 : Math.min(1, Math.max(0, (y - FAB_PAD) / maxY))
    };
}

function clamp(x: number, y: number, areaW: number, areaH: number) {
    const min = FAB_PAD;
    const maxX = Math.max(min, areaW - FAB_SIZE - FAB_PAD);
    const maxY = Math.max(min, areaH - FAB_SIZE - FAB_PAD);
    return {
        x: Math.min(maxX, Math.max(min, x)),
        y: Math.min(maxY, Math.max(min, y))
    };
}

interface AddFabProps {
    onClick: () => void;
    label: string;
}

export function AddFab({ onClick, label }: AddFabProps) {
    const shellRef = useRef<HTMLDivElement>(null);
    const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);
    const [dragging, setDragging] = useState(false);

    const dragRef = useRef({
        active: false,
        pointerId: -1,
        startClientX: 0,
        startClientY: 0,
        originX: 0,
        originY: 0,
        moved: false,
        timer: null as number | null
    });

    const measure = useCallback(() => {
        const el = shellRef.current;
        if (!el) return { w: 0, h: 0 };
        const r = el.getBoundingClientRect();
        return { w: r.width, h: r.height };
    }, []);

    const applySaved = useCallback(() => {
        const { w, h } = measure();
        if (w <= 0 || h <= 0) return;
        const saved = loadPos();
        setCoords(saved ? fromNorm(saved, w, h) : defaultPos(w, h));
    }, [measure]);

    useEffect(() => {
        applySaved();
        const onResize = () => {
            const { w, h } = measure();
            if (w <= 0 || h <= 0) return;
            setCoords((prev) => {
                if (!prev) return defaultPos(w, h);
                const next = clamp(prev.x, prev.y, w, h);
                savePos(toNorm(next.x, next.y, w, h));
                return next;
            });
        };
        window.addEventListener("resize", onResize);
        window.visualViewport?.addEventListener("resize", onResize);
        return () => {
            window.removeEventListener("resize", onResize);
            window.visualViewport?.removeEventListener("resize", onResize);
        };
    }, [applySaved, measure]);

    const clearTimer = () => {
        const d = dragRef.current;
        if (d.timer != null) {
            window.clearTimeout(d.timer);
            d.timer = null;
        }
    };

    const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
        if (e.button !== 0) return;
        const d = dragRef.current;
        const shell = shellRef.current;
        if (!shell) return;
        const rect = shell.getBoundingClientRect();
        const current = coords ?? defaultPos(rect.width, rect.height);

        d.pointerId = e.pointerId;
        d.startClientX = e.clientX;
        d.startClientY = e.clientY;
        d.originX = current.x;
        d.originY = current.y;
        d.moved = false;
        d.active = false;
        clearTimer();

        d.timer = window.setTimeout(() => {
            d.active = true;
            setDragging(true);
            try {
                navigator.vibrate?.(12);
            } catch {}
            try {
                e.currentTarget.setPointerCapture(e.pointerId);
            } catch {}
        }, LONG_PRESS_MS);
    };

    const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
        const d = dragRef.current;
        if (d.pointerId !== e.pointerId) return;

        const dx = e.clientX - d.startClientX;
        const dy = e.clientY - d.startClientY;
        const dist = Math.hypot(dx, dy);

        if (!d.active) {
            if (dist > MOVE_TOLERANCE) {
                clearTimer();
                d.moved = true;
            }
            return;
        }

        d.moved = true;
        const shell = shellRef.current;
        if (!shell) return;
        const rect = shell.getBoundingClientRect();
        setCoords(clamp(d.originX + dx, d.originY - dy, rect.width, rect.height));
    };

    const endPointer = (e: React.PointerEvent<HTMLButtonElement>) => {
        const d = dragRef.current;
        if (d.pointerId !== e.pointerId && d.pointerId !== -1) return;

        const wasDragging = d.active;
        const wasMoved = d.moved;
        clearTimer();

        if (wasDragging) {
            const shell = shellRef.current;
            setCoords((prev) => {
                if (!prev || !shell) return prev;
                const rect = shell.getBoundingClientRect();
                const c = clamp(prev.x, prev.y, rect.width, rect.height);
                savePos(toNorm(c.x, c.y, rect.width, rect.height));
                return c;
            });
            d.active = false;
            setDragging(false);
            try {
                e.currentTarget.releasePointerCapture(e.pointerId);
            } catch {}
            d.pointerId = -1;
            return;
        }

        d.pointerId = -1;
        setDragging(false);
        if (!wasMoved) onClick();
    };

    return (
        <div
            ref={shellRef}
            className="pointer-events-none fixed inset-x-0 bottom-0 z-20 mx-auto h-full max-w-md"
        >
            <button
                type="button"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endPointer}
                onPointerCancel={endPointer}
                onContextMenu={(e) => e.preventDefault()}
                className={cn(
                    "pointer-events-auto absolute flex size-[3.75rem] touch-none items-center justify-center rounded-full bg-[#5ED4FF] text-[#0b1b24] shadow-[0_10px_28px_rgba(94,212,255,0.45)] select-none",
                    dragging
                        ? "scale-110 cursor-grabbing shadow-[0_14px_36px_rgba(94,212,255,0.55)] ring-2 ring-white/50"
                        : "cursor-pointer transition-transform active:scale-90"
                )}
                style={
                    coords
                        ? {
                              left: coords.x,
                              bottom: coords.y,
                              right: "auto",
                              top: "auto"
                          }
                        : {
                              right: FAB_PAD,
                              bottom: `max(${FAB_PAD}px, env(safe-area-inset-bottom))`,
                              left: "auto",
                              top: "auto"
                          }
                }
                aria-label={label}
                title={label}
            >
                <Plus className="size-8" strokeWidth={2.5} />
            </button>
        </div>
    );
}
