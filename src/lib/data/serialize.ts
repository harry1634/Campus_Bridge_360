import { Timestamp } from "firebase-admin/firestore";

/** Recursively converts Firestore Timestamp fields into ISO strings so
 * documents can safely cross the server/client boundary in Next.js. */
export function toIsoTimestamps<T>(data: T): T {
  if (data instanceof Timestamp) {
    return data.toDate().toISOString() as unknown as T;
  }
  if (Array.isArray(data)) {
    return data.map((item) => toIsoTimestamps(item)) as unknown as T;
  }
  if (data && typeof data === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      result[key] = toIsoTimestamps(value);
    }
    return result as T;
  }
  return data;
}
