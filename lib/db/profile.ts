import { getDB } from "./client";
import { PROFILE_KEY, type ProfileRecord } from "./schema";

export async function getProfile(): Promise<ProfileRecord | undefined> {
  const db = await getDB();
  return db.get("profile", PROFILE_KEY);
}

export async function setProfile(profile: ProfileRecord): Promise<void> {
  const db = await getDB();
  await db.put("profile", profile, PROFILE_KEY);
}
