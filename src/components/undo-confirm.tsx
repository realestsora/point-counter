import type { ReactNode } from "react";
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
import { useI18n } from "@/hooks/use-i18n";
import type { UndoPreview } from "@/lib/history";

interface UndoConfirmProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    preview: UndoPreview | null;
    onConfirm: () => void;
}

export function UndoConfirm({
    open,
    onOpenChange,
    preview,
    onConfirm
}: UndoConfirmProps) {
    const { t } = useI18n();

    const confirmLabel =
        preview?.willRestorePlayer && preview.currentScore === t("removed")
            ? t("restore")
            : preview?.willRestorePlayer
              ? t("restoreAndUndo")
              : t("undo");

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader className="w-full place-items-stretch text-left sm:place-items-stretch">
                    <AlertDialogTitle>
                        {preview?.title ?? t("undoLastChange")}
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="w-full space-y-3 text-left text-sm text-muted-foreground">
                            {preview ? (
                                <>
                                    <UndoScoreCard preview={preview} />
                                    <p>{preview.explanation}</p>
                                    {preview.willRestorePlayer &&
                                        preview.currentScore !== t("removed") && (
                                            <p className="text-xs text-[#5ED4FF]/90">
                                                {t("playerMissingNote")}
                                            </p>
                                        )}
                                    {(preview.truncateCount ?? 0) > 0 && (
                                        <p className="text-xs text-amber-300/90">
                                            {(preview.truncateCount ?? 0) === 1
                                                ? t("truncateHistoryNote_one")
                                                : t("truncateHistoryNote_other", {
                                                      n: preview.truncateCount ?? 0
                                                  })}
                                        </p>
                                    )}
                                    {preview.steps > 1 && (
                                        <p className="text-xs text-muted-foreground/80">
                                            {t("groupedTapsNote")}
                                        </p>
                                    )}
                                </>
                            ) : (
                                <p>{t("nothingToUndo")}</p>
                            )}
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm} disabled={!preview}>
                        {confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

function UndoScoreCard({ preview }: { preview: UndoPreview }) {
    const { t } = useI18n();
    return (
        <div className="w-full overflow-hidden rounded-xl border border-border bg-muted/40">
            <Row
                label={t("player")}
                value={
                    <span className="flex items-center justify-end gap-2">
                        {preview.color && (
                            <span
                                className="size-2.5 shrink-0 rounded-full"
                                style={{ backgroundColor: preview.color }}
                            />
                        )}
                        {preview.subject}
                    </span>
                }
            />
            <Row
                label={t("now")}
                value={
                    <span className="tabular-nums font-semibold text-foreground">
                        {preview.currentScore}
                    </span>
                }
            />
            <Row
                label={t("afterUndo")}
                value={
                    <span className="tabular-nums font-semibold text-[#5ED4FF]">
                        {preview.restoredScore}
                    </span>
                }
                last
            />
        </div>
    );
}

function Row({
    label,
    value,
    last
}: {
    label: string;
    value: ReactNode;
    last?: boolean;
}) {
    return (
        <div
            className={`flex w-full items-center justify-between gap-3 px-3.5 py-2.5 ${
                last ? "" : "border-b border-border/70"
            }`}
        >
            <span className="shrink-0 text-xs tracking-wide text-muted-foreground uppercase">
                {label}
            </span>
            <span className="min-w-0 flex-1 truncate text-right text-sm text-foreground">
                {value}
            </span>
        </div>
    );
}
