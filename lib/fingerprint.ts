/**
 * Generates a deterministic fingerprint for a movement to prevent duplicates.
 * Rules:
 * 1. Normalize Soldier ID
 * 2. Normalize Start Date (YYYY-MM-DD)
 * 3. Normalize From/To locations (Lowercase, trimmed)
 */
export function generateMovementFingerprint(
    soldierId: string,
    startTime: Date | string,
    from: string,
    to: string
): string {
    const dateStr = typeof startTime === 'string'
        ? startTime.split('T')[0]
        : startTime.toISOString().split('T')[0];

    const normalizedFrom = from.trim().toLowerCase();
    const normalizedTo = to.trim().toLowerCase();

    return `${soldierId}|${dateStr}|${normalizedFrom}|${normalizedTo}`;
}
