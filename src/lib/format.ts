import type { Locale } from "@/lib/i18n";
import { playerCountLabel as i18nPlayers } from "@/lib/i18n";

const timeFmtCache = new Map<Locale, Intl.DateTimeFormat>();

function timeFmt(locale: Locale) {
    let fmt = timeFmtCache.get(locale);
    if (!fmt) {
        fmt = new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
        timeFmtCache.set(locale, fmt);
    }
    return fmt;
}

export function formatTime(ts: number, locale: Locale = "en") {
    return timeFmt(locale).format(new Date(ts));
}

export function formatSigned(n: number) {
    return n > 0 ? `+${n}` : String(n);
}

export function playerCountLabel(n: number, locale: Locale = "en") {
    return i18nPlayers(locale, n);
}
