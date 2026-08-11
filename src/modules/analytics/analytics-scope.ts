const STORAGE_KEY = "systemly:analytics-branch";

let currentBranchId: string | null = null;

export function getAnalyticsBranchId() {
  return currentBranchId;
}

export function restoreAnalyticsBranchId() {
  if (typeof window === "undefined") return currentBranchId;
  currentBranchId = window.localStorage.getItem(STORAGE_KEY) || null;
  return currentBranchId;
}

export function setAnalyticsBranchId(branchId: string | null) {
  currentBranchId = branchId;
  if (typeof window === "undefined") return;
  if (branchId) window.localStorage.setItem(STORAGE_KEY, branchId);
  else window.localStorage.removeItem(STORAGE_KEY);
}
