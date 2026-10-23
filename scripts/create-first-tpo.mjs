// One-time bootstrap: creates the very first TPO account directly via the
// Firebase Admin SDK, bypassing the app (which has no public TPO sign-up by
// design — see src/app/api/tpo/team/route.ts). After this account exists,
// use the in-app "Team" page (/tpo/team) to invite further TPO accounts.
//
// Usage:
//   node scripts/create-first-tpo.mjs "Full Name" "email@college.edu" "Designation (optional)"
//
// Reads Firebase Admin credentials from .env.local in the project root.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnvLocal() {
  const path = join(__dirname, "..", ".env.local");
  const content = readFileSync(path, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

async function main() {
  const [name, email, designation] = process.argv.slice(2);
  if (!name || !email) {
    console.error('Usage: node scripts/create-first-tpo.mjs "Full Name" "email@college.edu" "Designation"');
    process.exit(1);
  }

  loadEnvLocal();

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) {
    console.error("Missing FIREBASE_ADMIN_* credentials in .env.local");
    process.exit(1);
  }

  const app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  const auth = getAuth(app);
  const db = getFirestore(app);

  const existing = await auth.getUserByEmail(email).catch(() => null);
  if (existing) {
    console.error(`A user with email ${email} already exists (uid: ${existing.uid}).`);
    process.exit(1);
  }

  const tempPassword = crypto.randomUUID();
  const userRecord = await auth.createUser({
    email,
    password: tempPassword,
    displayName: name,
    emailVerified: true,
  });

  const now = FieldValue.serverTimestamp();
  const batch = db.batch();
  batch.set(db.collection("users").doc(userRecord.uid), {
    uid: userRecord.uid,
    email,
    role: "tpo",
    emailVerified: true,
    createdAt: now,
  });
  batch.set(db.collection("tpoProfiles").doc(userRecord.uid), {
    uid: userRecord.uid,
    name,
    email,
    designation: designation || "",
    createdAt: now,
  });
  await batch.commit();

  const resetLink = await auth.generatePasswordResetLink(email);

  console.log(`\nTPO account created for ${email} (uid: ${userRecord.uid}).`);
  console.log(`\nSet a password by opening this link:\n${resetLink}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
