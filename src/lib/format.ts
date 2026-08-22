const timeFmt = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
});

export function formatTime(ts: number) {
    return timeFmt.format(new Date(ts));
}

export function formatSigned(n: number) {
    return n > 0 ? `+${n}` : String(n);
}

export function playerCountLabel(n: number) {
    return n === 1 ? "1 player" : `${n} players`;
}
