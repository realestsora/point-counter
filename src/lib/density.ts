export type CardDensity = "comfortable" | "compact" | "grid";

export function getCardDensity(count: number): CardDensity {
    if (count >= 7) return "grid";
    if (count >= 4) return "compact";
    return "comfortable";
}
