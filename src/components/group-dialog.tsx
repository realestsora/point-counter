import { useEffect, useState } from "react";
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

interface GroupDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    initialName?: string;
    onSave: (name: string) => void;
}

export function GroupDialog({
    open,
    onOpenChange,
    title,
    initialName = "",
    onSave
}: GroupDialogProps) {
    const [name, setName] = useState(initialName);

    useEffect(() => {
        if (open) setName(initialName);
    }, [open, initialName]);

    const handleSave = () => {
        onSave(name.trim() || "Game");
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-sm">
                <DialogHeader className="border-b border-white/[0.06] px-5 py-4">
                    <DialogTitle className="text-base">{title}</DialogTitle>
                </DialogHeader>

                <div className="grid gap-2 px-5 py-5">
                    <Label
                        htmlFor="group-name"
                        className="text-xs font-medium tracking-wide text-white/45 uppercase"
                    >
                        Group name
                    </Label>
                    <Input
                        id="group-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. UNO, Pool, Poker..."
                        autoFocus
                        className="h-11 rounded-xl bg-white/[0.04]"
                        onKeyDown={(e) => e.key === "Enter" && handleSave()}
                    />
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
