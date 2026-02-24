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
import { db, ensureAuth, getCurrentUid, auth } from "./firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import type { GameState } from "@shared/schema";
import { getRiddles as getLocalRiddles, checkRiddleAnswer as checkLocalRiddleAnswer } from "./riddles";

const STORAGE_KEY = "shimen-riddle-game";
const PROFILE_KEY = "shimen-student-profile";
const COLLECTION_SCORES = "scores";
const COLLECTION_GAME_STATE = "gameStates";
const COLLECTION_PROFILES = "studentProfiles";

export interface StudentProfile {
  uid: string;
  className: string;
  seatNumber: string;
  nickname: string;
  createdAt: unknown;
}

function getDefaultState(): GameState {
  return { currentRiddleIndex: 0, solvedRiddles: [], attempts: {}, score: 0 };
}

function loadLocalState(): GameState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { }
  return getDefaultState();
}

function saveLocalState(state: GameState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { }
}

export function loadLocalProfile(): StudentProfile | null {
  try {
    const saved = localStorage.getItem(PROFILE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { }
  return null;
}

function saveLocalProfile(profile: StudentProfile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch { }
}

export async function saveStudentProfile(
  className: string,
  seatNumber: string,
  nickname: string
): Promise<StudentProfile> {
  const uid = await ensureAuth();
  const profile: StudentProfile = {
    uid,
    className,
    seatNumber,
    nickname,
    createdAt: serverTimestamp(),
  };

  const docRef = doc(db, COLLECTION_PROFILES, uid);
  await setDoc(docRef, profile);
  saveLocalProfile({ ...profile, createdAt: new Date().toISOString() });
  return profile;
}

export async function loadStudentProfile(): Promise<StudentProfile | null> {
  const local = loadLocalProfile();

  try {
    const uid = await ensureAuth();
    const docRef = doc(db, COLLECTION_PROFILES, uid);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      const profile = snapshot.data() as StudentProfile;
      saveLocalProfile(profile);
      return profile;
    }
  } catch { }

  return local;
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
  } catch { }

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
  } catch { }
}

export interface ScoreEntry {
  uid: string;
  nickname: string;
  className?: string;
  seatNumber?: string;
  score: number;
  solvedCount: number;
  totalTime?: number;
  createdAt: unknown;
}

export async function submitScore(
  score: number,
  solvedCount: number,
  totalTime?: number
): Promise<void> {
  try {
    const uid = await ensureAuth();
    const profile = loadLocalProfile();

    const docRef = doc(db, COLLECTION_SCORES, uid);
    await setDoc(docRef, {
      uid,
      nickname: profile?.nickname || "未填姓名",
      className: profile?.className || "",
      seatNumber: profile?.seatNumber || "",
      score,
      solvedCount,
      totalTime: totalTime ?? null,
      createdAt: serverTimestamp(),
    });
  } catch { }
}

export async function getLeaderboard(max = 1000): Promise<ScoreEntry[]> {
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

export async function getClassLeaderboard(): Promise<Record<string, { totalScore: number; count: number; avgScore: number }>> {
  try {
    await ensureAuth();
    const q = query(
      collection(db, COLLECTION_SCORES),
      orderBy("score", "desc")
    );
    const snapshot = await getDocs(q);
    const classMap: Record<string, { totalScore: number; count: number; avgScore: number }> = {};

    snapshot.docs.forEach((d) => {
      const entry = d.data() as ScoreEntry;
      if (!entry.className) return;
      if (!classMap[entry.className]) {
        classMap[entry.className] = { totalScore: 0, count: 0, avgScore: 0 };
      }
      classMap[entry.className].totalScore += entry.score;
      classMap[entry.className].count += 1;
      classMap[entry.className].avgScore =
        classMap[entry.className].totalScore / classMap[entry.className].count;
    });

    return classMap;
  } catch {
    return {};
  }
}

export async function getStatsForTeacher(): Promise<{
  totalPlayers: number;
  classStats: Record<string, number>;
  riddleStats: Record<number, { attempts: number; solved: number }>;
  allScores: ScoreEntry[];
}> {
  try {
    const user = auth.currentUser;
    if (!user || user.isAnonymous) {
      throw new Error("Unauthorized");
    }

    const statesQuery = query(collection(db, COLLECTION_GAME_STATE));
    const scoresQuery = query(collection(db, COLLECTION_SCORES), orderBy("score", "desc"));
    const profilesQuery = query(collection(db, COLLECTION_PROFILES));

    const [statesSnap, scoresSnap, profilesSnap] = await Promise.all([
      getDocs(statesQuery),
      getDocs(scoresQuery),
      getDocs(profilesQuery),
    ]);

    const allScores = scoresSnap.docs.map(d => d.data() as ScoreEntry);

    const classStats: Record<string, number> = {};
    profilesSnap.docs.forEach((d) => {
      const p = d.data() as StudentProfile;
      if (p.className) {
        classStats[p.className] = (classStats[p.className] || 0) + 1;
      }
    });

    const riddleStats: Record<number, { attempts: number; solved: number }> = {};
    statesSnap.docs.forEach((d) => {
      const state = d.data() as GameState;
      if (state.attempts) {
        Object.entries(state.attempts).forEach(([id, count]) => {
          const riddleId = parseInt(id);
          if (!riddleStats[riddleId]) {
            riddleStats[riddleId] = { attempts: 0, solved: 0 };
          }
          riddleStats[riddleId].attempts += count;
        });
      }
      if (state.solvedRiddles) {
        state.solvedRiddles.forEach((id) => {
          if (!riddleStats[id]) {
            riddleStats[id] = { attempts: 0, solved: 0 };
          }
          riddleStats[id].solved += 1;
        });
      }
    });

    return {
      totalPlayers: allScores.length,
      classStats,
      riddleStats,
      allScores
    };
  } catch {
    return { totalPlayers: 0, classStats: {}, riddleStats: {}, allScores: [] };
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
  } catch { }
}

export function clearLocalProfile(): void {
  try {
    localStorage.removeItem(PROFILE_KEY);
  } catch { }
}

export async function getRiddles() {
  return await getLocalRiddles();
}

export async function checkRiddleAnswer(riddleId: number, answer: string) {
  return await checkLocalRiddleAnswer(riddleId, answer);
}

export async function loginTeacher(email: string, pass: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email, pass);
}

export async function logoutTeacher(): Promise<void> {
  await signOut(auth);
}

export function isTeacherAuthenticated(): boolean {
  return !!auth.currentUser && !auth.currentUser.isAnonymous;
}
