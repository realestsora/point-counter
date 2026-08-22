import { useEffect, useRef, useState, type ReactNode } from "react";
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
import { pickColor } from "@/lib/storage";
import { COUNTER_COLORS, type Counter } from "@/types";
import { cn } from "@/lib/utils";

const STEP_PRESETS = [1, 5, 10] as const;

interface CounterDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    counter?: Counter | null;
    defaultName?: string;
    usedColors?: readonly string[];
    onSave: (data: {
        name: string;
        color: string;
        step: number;
        score?: number;
    }) => void;
}

export function CounterDialog({
    open,
    onOpenChange,
    counter,
    defaultName = "Player",
    usedColors = [],
    onSave
}: CounterDialogProps) {
    const isEdit = Boolean(counter);
    const nameRef = useRef<HTMLInputElement>(null);
    const [name, setName] = useState(defaultName);
    const [color, setColor] = useState<string>(COUNTER_COLORS[0]);
    const [step, setStep] = useState("1");
    const [score, setScore] = useState("0");

    useEffect(() => {
        if (!open) return;

        if (counter) {
            setName(counter.name);
            setColor(counter.color);
            setStep(String(counter.step));
            setScore(String(counter.score));
            return;
        }

        setName(defaultName);
        setColor(pickColor(usedColors));
        setStep("1");
        setScore("0");
    }, [open]);

    const handleSave = () => {
        const parsedStep = Math.max(1, Number.parseInt(step, 10) || 1);
        const parsedScore = Number.parseInt(score, 10);

        onSave({
            name: name.trim() || defaultName,
            color,
            step: parsedStep,
            score: Number.isFinite(parsedScore) ? parsedScore : 0
        });
        onOpenChange(false);
    };

    const previewScore = isEdit ? (score === "" ? "0" : score) : "0";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="gap-0 overflow-hidden p-0 sm:max-w-md"
                onOpenAutoFocus={(e) => {
                    e.preventDefault();
                    nameRef.current?.focus();
                    nameRef.current?.select();
                }}
            >
                <DialogHeader className="border-b border-white/[0.06] px-5 py-4">
                    <DialogTitle className="text-base">
                        {isEdit ? "Edit player" : "Add player"}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-5 px-5 py-5">
                    <div
                        className="relative overflow-hidden rounded-2xl px-4 py-5"
                        style={{
                            background: `linear-gradient(165deg, color-mix(in srgb, ${color} 92%, white) 0%, ${color} 48%, color-mix(in srgb, ${color} 88%, #1a1a1a) 100%)`
                        }}
                    >
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/22 to-transparent" />
                        <div className="relative flex items-center gap-3">
                            <div className="flex size-12 items-center justify-center rounded-full bg-white text-neutral-900 shadow-sm">
                                <Minus className="size-5" strokeWidth={2.5} />
                            </div>
                            <div className="min-w-0 flex-1 text-center text-white">
                                <div className="text-4xl leading-none font-bold tabular-nums">
                                    {previewScore}
                                </div>
                                <div className="mt-1.5 truncate text-sm font-semibold text-white/95">
                                    {name.trim() || defaultName}
                                </div>
                            </div>
                            <div className="flex size-12 items-center justify-center rounded-full bg-white text-neutral-900 shadow-sm">
                                <Plus className="size-5" strokeWidth={2.5} />
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <Field label="Name" htmlFor="counter-name">
                            <Input
                                ref={nameRef}
                                id="counter-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Player name"
                                className="h-11 rounded-xl bg-white/[0.04]"
                                onKeyDown={(e) =>
                                    e.key === "Enter" && handleSave()
                                }
                            />
                        </Field>

                        {isEdit && (
                            <Field label="Score" htmlFor="counter-score">
                                <Input
                                    id="counter-score"
                                    type="number"
                                    value={score}
                                    onChange={(e) => setScore(e.target.value)}
                                    className="h-11 rounded-xl bg-white/[0.04]"
                                />
                            </Field>
                        )}

                        <Field label="Step ±" htmlFor="counter-step">
                            <div className="flex gap-2">
                                {STEP_PRESETS.map((n) => (
                                    <button
                                        key={n}
                                        type="button"
                                        onClick={() => setStep(String(n))}
                                        className={cn(
                                            "h-11 flex-1 rounded-xl text-sm font-semibold transition-colors",
                                            step === String(n)
                                                ? "bg-white text-black"
                                                : "bg-white/[0.06] text-white/70 hover:bg-white/10"
                                        )}
                                    >
                                        {n}
                                    </button>
                                ))}
                                <Input
                                    id="counter-step"
                                    type="number"
                                    min={1}
                                    value={step}
                                    onChange={(e) => setStep(e.target.value)}
                                    className="h-11 w-20 rounded-xl bg-white/[0.04] text-center"
                                />
                            </div>
                        </Field>

                        <Field label="Color">
                            <div className="grid grid-cols-5 gap-2.5">
                                {COUNTER_COLORS.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setColor(c)}
                                        className={cn(
                                            "aspect-square rounded-full transition-all",
                                            color === c
                                                ? "scale-105 ring-2 ring-white ring-offset-2 ring-offset-background"
                                                : "opacity-75 hover:opacity-100"
                                        )}
                                        style={{ backgroundColor: c }}
                                        aria-label={`Color ${c}`}
                                    />
                                ))}
                            </div>
                        </Field>
                    </div>
                </div>

                <DialogFooter className="mx-0 mb-0 flex-row items-center justify-end gap-2 rounded-none border-t border-white/[0.06] bg-transparent p-4 px-5">
                    <Button
                        type="button"
                        variant="ghost"
                        className="h-10 rounded-xl px-4"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        className="h-10 rounded-xl bg-[#5ED4FF] px-5 font-semibold text-black hover:bg-[#5ED4FF]/90"
                        onClick={handleSave}
                    >
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function Field({
    label,
    htmlFor,
    children
}: {
    label: string;
    htmlFor?: string;
    children: ReactNode;
}) {
    return (
        <div className="grid gap-2">
            <Label
                htmlFor={htmlFor}
                className="text-xs font-medium tracking-wide text-white/45 uppercase"
            >
                {label}
            </Label>
            {children}
        </div>
    );
}
