import { formatYMD } from "./date";

export function getDailyChest(dateStr = formatYMD()) {
  if (typeof window === "undefined") return { opened: false, exp: 0, message: "" };
  try {
    const saved = localStorage.getItem(`monev_chest_${dateStr}`);
    return saved ? JSON.parse(saved) : { opened: false, exp: 0, message: "" };
  } catch {
    return { opened: false, exp: 0, message: "" };
  }
}

export function saveDailyChest(chestData, dateStr = formatYMD()) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`monev_chest_${dateStr}`, JSON.stringify(chestData));
  } catch (e) {
    console.error("Storage error:", e);
  }
}

export function getClaimedQuests(dateStr = formatYMD()) {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(`monev_claimed_quests_${dateStr}`);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveClaimedQuests(questIds, dateStr = formatYMD()) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`monev_claimed_quests_${dateStr}`, JSON.stringify(questIds));
  } catch (e) {
    console.error("Storage error:", e);
  }
}

export function getBonusExp() {
  if (typeof window === "undefined") return 0;
  try {
    return parseInt(localStorage.getItem("monev_bonus_exp") || "0", 10);
  } catch {
    return 0;
  }
}

export function saveBonusExp(exp) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("monev_bonus_exp", String(exp));
  } catch (e) {
    console.error("Storage error:", e);
  }
}
