import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db, ensureAuth, getCurrentUid } from "./firebase";
import type { GameState } from "@shared/schema";

const STORAGE_KEY = "shimen-riddle-game";
const COLLECTION_SCORES = "scores";
const COLLECTION_GAME_STATE = "gameStates";

function getDefaultState(): GameState {
  return { currentRiddleIndex: 0, solvedRiddles: [], attempts: {}, score: 0 };
}

function loadLocalState(): GameState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return getDefaultState();
}

function saveLocalState(state: GameState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export async function loadGameState(): Promise<GameState> {
  const localState = loadLocalState();

  try {
    const uid = await ensureAuth();
    const docRef = doc(db, COLLECTION_GAME_STATE, uid);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      const cloudState = snapshot.data() as GameState;
      if (cloudState.solvedRiddles.length >= localState.solvedRiddles.length) {
        saveLocalState(cloudState);
        return cloudState;
      }
    }

    if (localState.solvedRiddles.length > 0) {
      await setDoc(docRef, {
        ...localState,
        updatedAt: serverTimestamp(),
      });
    }
  } catch {}

  return localState;
}

export async function saveGameState(state: GameState): Promise<void> {
  saveLocalState(state);

  try {
    const uid = getCurrentUid();
    if (!uid) return;

    const docRef = doc(db, COLLECTION_GAME_STATE, uid);
    await setDoc(docRef, {
      ...state,
      updatedAt: serverTimestamp(),
    });
  } catch {}
}

export interface ScoreEntry {
  uid: string;
  nickname: string;
  score: number;
  solvedCount: number;
  totalTime?: number;
  createdAt: unknown;
}

export async function submitScore(
  nickname: string,
  score: number,
  solvedCount: number,
  totalTime?: number
): Promise<void> {
  try {
    const uid = await ensureAuth();
    const docRef = doc(db, COLLECTION_SCORES, uid);
    await setDoc(docRef, {
      uid,
      nickname,
      score,
      solvedCount,
      totalTime: totalTime ?? null,
      createdAt: serverTimestamp(),
    });
  } catch {}
}

export async function getLeaderboard(max = 20): Promise<ScoreEntry[]> {
  try {
    await ensureAuth();
    const q = query(
      collection(db, COLLECTION_SCORES),
      orderBy("score", "desc"),
      limit(max)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as ScoreEntry);
  } catch {
    return [];
  }
}

export async function resetGameState(): Promise<void> {
  const defaultState = getDefaultState();
  saveLocalState(defaultState);

  try {
    const uid = getCurrentUid();
    if (!uid) return;

    const docRef = doc(db, COLLECTION_GAME_STATE, uid);
    await setDoc(docRef, {
      ...defaultState,
      updatedAt: serverTimestamp(),
    });
  } catch {}
}
