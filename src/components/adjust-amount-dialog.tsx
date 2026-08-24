import { useEffect, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/hooks/use-i18n";
import { cn, isTouchPrimary } from "@/lib/utils";

const PRESETS = [5, 10, 20, 50, 100] as const;

interface AdjustAmountDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    playerName: string;
    color?: string;
    currentScore: number;
    direction: 1 | -1;
    defaultAmount?: number;
    onConfirm: (delta: number) => void;
}

export function AdjustAmountDialog({
    open,
    onOpenChange,
    playerName,
    color,
    currentScore,
    direction,
    defaultAmount = 1,
    onConfirm
}: AdjustAmountDialogProps) {
    const { t } = useI18n();
    const inputRef = useRef<HTMLInputElement>(null);
    const [amount, setAmount] = useState(String(defaultAmount));

    useEffect(() => {
        if (!open) return;
        setAmount(String(Math.max(1, defaultAmount)));
    }, [open, defaultAmount]);

    const parsed = Math.abs(Number.parseInt(amount, 10) || 0);
    const valid = parsed > 0;
    const delta = direction * parsed;
    const nextScore = currentScore + delta;
    const isPlus = direction > 0;

    const apply = () => {
        if (!valid) return;
        onConfirm(delta);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="gap-0 overflow-hidden p-0 sm:max-w-sm"
                onOpenAutoFocus={(e) => {
                    e.preventDefault();
                    if (isTouchPrimary()) return;
                    inputRef.current?.focus();
                    inputRef.current?.select();
                }}
            >
                <DialogHeader className="border-b border-white/[0.06] px-5 py-4">
                    <DialogTitle className="flex items-center gap-2 text-base">
                        <span
                            className={cn(
                                "flex size-8 items-center justify-center rounded-full",
                                isPlus
                                    ? "bg-[#5ED4FF]/20 text-[#5ED4FF]"
                                    : "bg-white/10 text-white/80"
                            )}
                        >
                            {isPlus ? (
                                <Plus className="size-4" strokeWidth={2.5} />
                            ) : (
                                <Minus className="size-4" strokeWidth={2.5} />
                            )}
                        </span>
                        {isPlus ? t("customAddTitle") : t("customSubTitle")}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 px-5 py-5">
                    <div className="flex items-center gap-2.5 rounded-xl bg-white/[0.04] px-3 py-2.5">
                        {color && (
                            <span
                                className="size-3 shrink-0 rounded-full"
                                style={{ backgroundColor: color }}
                            />
                        )}
                        <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                            {playerName}
                        </span>
                        <span className="shrink-0 text-xs text-white/40">
                            {t("now")}:{" "}
                            <span className="font-semibold tabular-nums text-white/80">
                                {currentScore}
                            </span>
                        </span>
                    </div>

                    <div className="grid gap-2">
                        <Label
                            htmlFor="adjust-amount"
                            className="text-xs font-medium tracking-wide text-white/45 uppercase"
                        >
                            {t("amount")}
                        </Label>
                        <Input
                            ref={inputRef}
                            id="adjust-amount"
                            type="number"
                            min={1}
                            inputMode="numeric"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && apply()}
                            className="h-12 rounded-xl bg-white/[0.04] text-center text-2xl font-bold tabular-nums"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {PRESETS.map((n) => (
                            <button
                                key={n}
                                type="button"
                                onClick={() => setAmount(String(n))}
                                className={cn(
                                    "h-9 min-w-12 flex-1 rounded-xl text-sm font-semibold transition-colors",
                                    amount === String(n)
                                        ? "bg-white text-black"
                                        : "bg-white/[0.06] text-white/70 hover:bg-white/10"
                                )}
                            >
                                {n}
                            </button>
                        ))}
                    </div>

                    {valid && (
                        <p className="text-center text-sm text-white/50">
                            {currentScore}{" "}
                            <span
                                className={
                                    isPlus ? "text-[#5ED4FF]" : "text-white/70"
                                }
                            >
                                {isPlus ? `+${parsed}` : `−${parsed}`}
                            </span>{" "}
                            →{" "}
                            <span className="font-semibold tabular-nums text-white">
                                {nextScore}
                            </span>
                        </p>
                    )}
                </div>

                <DialogFooter className="mx-0 mb-0 flex-row items-center justify-end gap-2 rounded-none border-t border-white/[0.06] bg-transparent p-4 px-5">
                    <Button
                        type="button"
                        variant="ghost"
                        className="h-10 rounded-xl px-4"
                        onClick={() => onOpenChange(false)}
                    >
                        {t("cancel")}
                    </Button>
                    <Button
                        type="button"
                        disabled={!valid}
                        className="h-10 rounded-xl bg-[#5ED4FF] px-5 font-semibold text-black hover:bg-[#5ED4FF]/90 disabled:opacity-40"
                        onClick={apply}
                    >
                        {isPlus
                            ? t("applyAdd", { n: parsed || 0 })
                            : t("applySub", { n: parsed || 0 })}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
