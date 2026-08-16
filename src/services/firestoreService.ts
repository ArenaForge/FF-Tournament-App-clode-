import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  type QueryConstraint,
  type DocumentData,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/firebase/config";

export async function getDocument<T>(path: string): Promise<T | null> {
  try {
    const snap = await getDoc(doc(db, path));

    console.log("[Firestore Debug] getDocument Path:", path);
    console.log("[Firestore Debug] getDocument Exists:", snap.exists());
    console.log("[Firestore Debug] getDocument Data:", snap.data());

    return snap.exists() ? (snap.data() as T) : null;
  } catch (error) {
    console.error("[Firestore Debug] getDocument ERROR:", error);
    console.error("[Firestore Debug] getDocument Path:", path);
    return null;
  }
}

export async function setDocument<T extends DocumentData>(
  path: string,
  data: T,
  merge = true
): Promise<void> {
  await setDoc(doc(db, path), data, { merge });
}

export async function updateDocument(
  path: string,
  data: Partial<DocumentData>
): Promise<void> {
  await updateDoc(doc(db, path), data);
}

export async function deleteDocument(path: string): Promise<void> {
  await deleteDoc(doc(db, path));
}

export async function getCollection<T>(
  collectionPath: string,
  constraints: QueryConstraint[] = []
): Promise<(T & { id: string })[]> {
  const q = query(collection(db, collectionPath), ...constraints);
  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as T),
  }));
}

export function subscribeToCollection<T>(
  collectionPath: string,
  callback: (items: (T & { id: string })[]) => void,
  constraints: QueryConstraint[] = []
): Unsubscribe {
  const q = query(collection(db, collectionPath), ...constraints);

  return onSnapshot(
    q,
    (snap) => {
      console.log(
        "[Firestore Debug] Collection:",
        collectionPath,
        "Docs:",
        snap.size
      );

      callback(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as T),
        }))
      );
    },
    (error) => {
      console.error(
        `[Firestore Debug] Collection error on ${collectionPath}:`,
        error
      );
    }
  );
}

export function subscribeToDocument<T>(
  path: string,
  callback: (data: T | null) => void
): Unsubscribe {
  console.log("[Firestore Debug] Starting document listener:", path);

  return onSnapshot(
    doc(db, path),
    (snap) => {
      console.log("[Firestore Debug] Path:", path);
      console.log("[Firestore Debug] Exists:", snap.exists());
      console.log("[Firestore Debug] Data:", snap.data());

      if (snap.exists()) {
        callback(snap.data() as T);
      } else {
        console.warn(
          "[Firestore Debug] Document does NOT exist:",
          path
        );
        callback(null);
      }
    },
    (error) => {
      console.error("[Firestore Debug] ERROR:", error);
      console.error("[Firestore Debug] ERROR CODE:", error.code);
      console.error("[Firestore Debug] ERROR MESSAGE:", error.message);
      console.error("[Firestore Debug] Path:", path);

      // Important: stop roleLoading instead of leaving it hanging.
      callback(null);
    }
  );
}
