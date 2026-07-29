import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/firebase/config";

/**
 * Uploads a file to the given Storage path and returns its public
 * download URL. Callers own path structure — e.g. avatars/{uid}.jpg or
 * tournamentBanners/{tournamentId}.jpg — see storage.rules for the
 * corresponding access rules per prefix.
 */
export async function uploadFile(path: string, file: File): Promise<string> {
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}

export async function deleteFile(path: string): Promise<void> {
  await deleteObject(ref(storage, path));
}

export function buildAvatarPath(uid: string, file: File): string {
  const ext = file.name.split(".").pop() ?? "jpg";
  return `avatars/${uid}.${ext}`;
}

export function buildTournamentBannerPath(tournamentId: string, file: File): string {
  const ext = file.name.split(".").pop() ?? "jpg";
  return `tournamentBanners/${tournamentId}.${ext}`;
}
