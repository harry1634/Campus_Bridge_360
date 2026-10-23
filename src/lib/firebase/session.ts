import "server-only";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "./admin";
import type { UserRole } from "@/lib/types";

const SESSION_COOKIE_NAME = "__session";

export async function verifySessionCookie() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return decoded;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const decoded = await verifySessionCookie();
  if (!decoded) return null;

  const userDoc = await adminDb.collection("users").doc(decoded.uid).get();
  if (!userDoc.exists) return null;

  const data = userDoc.data() as { role: UserRole; email: string };
  return { uid: decoded.uid, email: data.email, role: data.role };
}

export async function requireRole(role: UserRole) {
  const user = await getCurrentUser();
  if (!user || user.role !== role) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export { SESSION_COOKIE_NAME };
