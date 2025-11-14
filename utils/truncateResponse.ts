// utils/truncateResponse.ts

/**
 * Recursively walks a JSON-like structure and:
 * - For any array with more than 1 item:
 *   keeps only the first element (recursively truncated),
 *   then adds a "[TRUNCATED - N more items]" marker.
 * - Preserves objects / primitives as-is (recursively for objects).
 *
 * This keeps overall structure but massively reduces size.
 */
export function truncateResponse(value: any): any {
    // Handle arrays
    if (Array.isArray(value)) {
      if (value.length === 0) return [];
  
      if (value.length === 1) {
        // Single element → still recurse into it
        return [truncateResponse(value[0])];
      }
  
      // Multiple elements → keep first, then marker
      const first = truncateResponse(value[0]);
      const remainingCount = value.length - 1;
  
      return [
        first,
        `[TRUNCATED - ${remainingCount} more item${remainingCount === 1 ? "" : "s"}]`,
      ];
    }
  
    // Handle plain objects
    if (value && typeof value === "object") {
      const out: any = Array.isArray(value) ? [] : {};
      for (const [key, child] of Object.entries(value)) {
        out[key] = truncateResponse(child);
      }
      return out;
    }
  
    // Primitives (string, number, boolean, null, undefined)
    return value;
  }
  