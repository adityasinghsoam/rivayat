export function logAction(action: string, details: Record<string, string | number | boolean | null | undefined>) {
  console.info(`[action] ${action}`, details);
}
