const STORAGE_KEY = "systemly:operations-branch";

let currentBranchId: string | null = null;

export function getOperationalBranchId() {
  return currentBranchId;
}

export function restoreOperationalBranchId() {
  if (typeof window === "undefined") return currentBranchId;
  currentBranchId = window.localStorage.getItem(STORAGE_KEY) || null;
  return currentBranchId;
}

export function setOperationalBranchId(branchId: string | null) {
  currentBranchId = branchId;
  if (typeof window === "undefined") return;
  if (branchId) window.localStorage.setItem(STORAGE_KEY, branchId);
  else window.localStorage.removeItem(STORAGE_KEY);
}
