import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode
} from "react";
import {
    loadLocale,
    saveLocale,
    t as translate,
    type Locale,
    type MessageKey
} from "@/lib/i18n";

interface I18nContextValue {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: MessageKey, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>(loadLocale);

    const setLocale = useCallback((next: Locale) => {
        setLocaleState(next);
        saveLocale(next);
    }, []);

    useEffect(() => {
        document.documentElement.lang = locale === "vi" ? "vi" : "en";
    }, [locale]);

    const t = useCallback(
        (key: MessageKey, params?: Record<string, string | number>) =>
            translate(locale, key, params),
        [locale]
    );

    const value = useMemo(
        () => ({ locale, setLocale, t }),
        [locale, setLocale, t]
    );

    return (
        <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
    );
}

export function useI18n() {
    const ctx = useContext(I18nContext);
    if (!ctx) throw new Error("useI18n must be used within I18nProvider");
    return ctx;
}
