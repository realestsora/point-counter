import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function isTouchPrimary() {
    if (typeof window === "undefined") return false;
    try {
        return window.matchMedia("(pointer: coarse)").matches;
    } catch {
        return "ontouchstart" in window;
    }
}
