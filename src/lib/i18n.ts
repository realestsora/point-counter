export type Locale = "en" | "vi";

export const LOCALES: Locale[] = ["en", "vi"];

export const LOCALE_LABELS: Record<Locale, string> = {
    en: "English",
    vi: "Tiếng Việt"
};

const en = {
    scoreboard: "Scoreboard",
    undo: "Undo",
    history: "History",
    menu: "Menu",
    renameGroup: "Rename group",
    newGroup: "New group",
    resetAllScores: "Reset all scores",
    showTotalScore: "Show total score",
    sort: "Sort",
    sortManual: "Manual (drag)",
    sortManualShort: "Manual",
    sortHigh: "High → low",
    sortLow: "Low → high",
    deleteGroup: "Delete group",
    dragToReorder: "drag to reorder",
    combinedScore: "Combined score",
    noPlayersYet: "No players yet",
    addPlayerToStart: "Add a player to start scoring",
    addPlayer: "Add player",
    editPlayer: "Edit player",
    madeBy: "Made by Sora with",
    playerN: "Player {n}",
    player: "Player",
    game: "Game",
    gameN: "Game {n}",
    players_one: "1 player",
    players_other: "{n} players",
    deletePlayerTitle: "Delete player?",
    deletePlayerDesc:
        '"{name}" will be removed. You can restore them with Undo or from history.',
    cancel: "Cancel",
    delete: "Delete",
    resetAllTitle: "Reset all scores?",
    resetAllDesc:
        'Scores in "{name}" will go to 0. You can undo from history.',
    reset: "Reset",
    deleteGroupTitle: "Delete group?",
    deleteGroupDesc: '"{name}" and all its scores will be removed.',
    name: "Name",
    playerName: "Player name",
    score: "Score",
    step: "Step ±",
    color: "Color",
    colorSwatch: "Color {c}",
    save: "Save",
    groupName: "Group name",
    groupNamePlaceholder: "e.g. UNO, Pool, Poker...",
    options: "Options",
    edit: "Edit",
    resetScore: "Reset score",
    decrease: "Decrease {name}",
    increase: "Increase {name}",
    scoreHistory: "Score history",
    clear: "Clear",
    historyHint: "Grouped ± taps · expand for steps",
    noScoreChanges: "No score changes yet",
    prev: "Prev",
    next: "Next",
    pageOf: "Page {page}/{total}",
    groupsCount: "{n} groups",
    taps: "{n} taps",
    latest: "latest",
    undoThisStep: "Undo this step",
    clearHistoryTitle: "Clear history?",
    clearHistoryDesc:
        "All score history for this group will be removed. This cannot be undone.",
    resetAll: "Reset all",
    removedScore: "Removed · score {score}",
    playersToZero_one: "1 player → 0",
    playersToZero_other: "{n} players → 0",
    undoLastChange: "Undo last change?",
    nothingToUndo: "Nothing to undo right now.",
    playerMissingNote: "Player is missing and will be added back to this group.",
    groupedTapsNote:
        "Grouped taps undo together. Expand history to undo a single step.",
    restore: "Restore",
    restoreAndUndo: "Restore & undo",
    now: "Now",
    afterUndo: "After undo",
    removed: "removed",
    previous: "previous",
    undoResetAllTitle: "Undo reset all?",
    undoResetAllExpl:
        "Restores scores for {n} player(s) from before the reset.",
    restorePlayerTitle: "Restore {name}?",
    restorePlayerExpl:
        "Brings {name} back with score {score}, color, and step settings.",
    restoreNote:
        " {name} was removed and will be restored (the remove entry is cleared from history).",
    undoPlayerTitle: "Undo {name}?",
    restoreUndoPlayerTitle: "Restore & undo {name}?",
    undoRestoreExpl: "Restores {name} from {from} back to {to}.",
    undoResetExpl: "Undoes the reset and puts {name} back to {to}.",
    undoSetExpl: "Undoes the manual score edit for {name}.",
    undoAdjustExpl: "Removes {delta} from {name} (one tap).",
    undoClusterExpl:
        "Reverts {steps} quick taps on {name} ({delta} total) back to {to}.",
    language: "Language",
    langEn: "English",
    langVi: "Tiếng Việt"
} as const;

const vi: { [K in keyof typeof en]: string } = {
    scoreboard: "Bảng điểm",
    undo: "Hoàn tác",
    history: "Lịch sử",
    menu: "Menu",
    renameGroup: "Đổi tên nhóm",
    newGroup: "Nhóm mới",
    resetAllScores: "Reset tất cả điểm",
    showTotalScore: "Hiện tổng điểm",
    sort: "Sắp xếp",
    sortManual: "Thủ công (kéo)",
    sortManualShort: "Thủ công",
    sortHigh: "Cao → thấp",
    sortLow: "Thấp → cao",
    deleteGroup: "Xóa nhóm",
    dragToReorder: "kéo để sắp xếp",
    combinedScore: "Tổng điểm",
    noPlayersYet: "Chưa có người chơi",
    addPlayerToStart: "Thêm người chơi để bắt đầu ghi điểm",
    addPlayer: "Thêm người chơi",
    editPlayer: "Sửa người chơi",
    madeBy: "Made by Sora with",
    playerN: "Người chơi {n}",
    player: "Người chơi",
    game: "Ván chơi",
    gameN: "Ván {n}",
    players_one: "1 người",
    players_other: "{n} người",
    deletePlayerTitle: "Xóa người chơi?",
    deletePlayerDesc:
        '"{name}" sẽ bị xóa. Bạn có thể khôi phục bằng Hoàn tác hoặc từ lịch sử.',
    cancel: "Hủy",
    delete: "Xóa",
    resetAllTitle: "Reset tất cả điểm?",
    resetAllDesc:
        'Điểm trong "{name}" sẽ về 0. Bạn có thể hoàn tác từ lịch sử.',
    reset: "Reset",
    deleteGroupTitle: "Xóa nhóm?",
    deleteGroupDesc: '"{name}" và toàn bộ điểm sẽ bị xóa.',
    name: "Tên",
    playerName: "Tên người chơi",
    score: "Điểm",
    step: "Bước ±",
    color: "Màu",
    colorSwatch: "Màu {c}",
    save: "Lưu",
    groupName: "Tên nhóm",
    groupNamePlaceholder: "vd. UNO, Bida, Poker...",
    options: "Tùy chọn",
    edit: "Sửa",
    resetScore: "Reset điểm",
    decrease: "Giảm {name}",
    increase: "Tăng {name}",
    scoreHistory: "Lịch sử điểm",
    clear: "Xóa hết",
    historyHint: "Gom các lần ± · mở rộng để xem từng bước",
    noScoreChanges: "Chưa có thay đổi điểm",
    prev: "Trước",
    next: "Sau",
    pageOf: "Trang {page}/{total}",
    groupsCount: "{n} nhóm",
    taps: "{n} lần",
    latest: "mới nhất",
    undoThisStep: "Hoàn tác bước này",
    clearHistoryTitle: "Xóa lịch sử?",
    clearHistoryDesc:
        "Toàn bộ lịch sử điểm của nhóm này sẽ bị xóa. Không thể hoàn tác.",
    resetAll: "Reset tất cả",
    removedScore: "Đã xóa · điểm {score}",
    playersToZero_one: "1 người → 0",
    playersToZero_other: "{n} người → 0",
    undoLastChange: "Hoàn tác thay đổi gần nhất?",
    nothingToUndo: "Hiện không có gì để hoàn tác.",
    playerMissingNote:
        "Người chơi đã bị xóa và sẽ được thêm lại vào nhóm này.",
    groupedTapsNote:
        "Các lần bấm liên tiếp được hoàn tác cùng lúc. Mở rộng lịch sử để hoàn tác từng bước.",
    restore: "Khôi phục",
    restoreAndUndo: "Khôi phục & hoàn tác",
    now: "Hiện tại",
    afterUndo: "Sau hoàn tác",
    removed: "đã xóa",
    previous: "trước đó",
    undoResetAllTitle: "Hoàn tác reset tất cả?",
    undoResetAllExpl: "Khôi phục điểm của {n} người chơi về trước khi reset.",
    restorePlayerTitle: "Khôi phục {name}?",
    restorePlayerExpl:
        "Thêm lại {name} với điểm {score}, màu và bước ±.",
    restoreNote:
        " {name} đã bị xóa và sẽ được khôi phục (mục xóa trong lịch sử cũng bị gỡ).",
    undoPlayerTitle: "Hoàn tác {name}?",
    restoreUndoPlayerTitle: "Khôi phục & hoàn tác {name}?",
    undoRestoreExpl: "Đưa {name} từ {from} về {to}.",
    undoResetExpl: "Hoàn tác reset và đưa {name} về {to}.",
    undoSetExpl: "Hoàn tác chỉnh điểm thủ công của {name}.",
    undoAdjustExpl: "Gỡ {delta} khỏi {name} (một lần bấm).",
    undoClusterExpl:
        "Hoàn tác {steps} lần bấm nhanh trên {name} (tổng {delta}) về {to}.",
    language: "Ngôn ngữ",
    langEn: "English",
    langVi: "Tiếng Việt"
};

export type MessageKey = keyof typeof en;

const dict: Record<Locale, Record<MessageKey, string>> = { en, vi };

export function t(
    locale: Locale,
    key: MessageKey,
    params?: Record<string, string | number>
): string {
    let s = dict[locale][key] ?? dict.en[key] ?? key;
    if (params) {
        for (const [k, v] of Object.entries(params)) {
            s = s.replaceAll(`{${k}}`, String(v));
        }
    }
    return s;
}

export function playerCountLabel(locale: Locale, n: number) {
    return n === 1
        ? t(locale, "players_one")
        : t(locale, "players_other", { n });
}

const LOCALE_KEY = "point-counter-locale";

export function loadLocale(): Locale {
    try {
        const v = localStorage.getItem(LOCALE_KEY);
        if (v === "en" || v === "vi") return v;
    } catch {}
    return "en";
}

export function saveLocale(locale: Locale) {
    try {
        localStorage.setItem(LOCALE_KEY, locale);
    } catch {}
}
