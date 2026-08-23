interface TotalBarProps {
    total: number;
    playerCount: number;
}

export function TotalBar({ total, playerCount }: TotalBarProps) {
    if (playerCount === 0) return null;

    return (
        <div className="mx-4 mb-3 flex items-baseline justify-between gap-3 rounded-2xl bg-white/[0.04] px-4 py-3 ring-1 ring-white/[0.06]">
            <span className="text-sm text-white/45">Total</span>
            <span className="text-2xl leading-none font-bold tabular-nums tracking-tight text-[#5ED4FF]">
                {total}
            </span>
        </div>
    );
}
