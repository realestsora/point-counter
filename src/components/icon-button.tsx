import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function IconButton({
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
