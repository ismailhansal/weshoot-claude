import { useEffect, useState } from "react";

const DEMO_SESSION_KEY = "weshoot.demo-session";
const DEMO_NAME_KEY = "weshoot.demo-name";
const DEMO_AVATAR_KEY = "weshoot.demo-avatar";
const DEMO_ROLE_KEY = "weshoot.demo-role";
const DEMO_PROFILES_KEY = "weshoot.demo-profiles";
const AUTH_EVENT = "weshoot:auth";

export type DemoRole = "client" | "creator";

/** Compte démo créateur : sert à tester l'espace prestataire (mot de passe libre en mode démo). */
export const DEMO_CREATOR_EMAIL = "amine@weshoot.demo";

/** Sans backend, le type de compte est déduit de l'email ; il viendra du serveur plus tard. */
export function getRoleForEmail(email: string): DemoRole {
  return email.trim().toLowerCase() === DEMO_CREATOR_EMAIL ? "creator" : "client";
}

type DemoProfile = { name?: string; avatar?: string };

function readProfiles(): Record<string, DemoProfile> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(DEMO_PROFILES_KEY) ?? "{}");
  } catch {
    return {};
  }
}

/** Profil mémorisé pour cet email (prénom + avatar saisis à l'inscription ou à une connexion précédente). */
export function getDemoProfile(email: string): DemoProfile | null {
  return readProfiles()[email.trim().toLowerCase()] ?? null;
}

export function getDemoSessionEmail(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(DEMO_SESSION_KEY);
}

export function getDemoSessionName(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(DEMO_NAME_KEY);
}

export function getDemoSessionAvatar(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(DEMO_AVATAR_KEY);
}

/** `avatar` : data URL (image réduite) issue de la photo de profil de l'inscription. */
export function getDemoSessionRole(): DemoRole {
  if (typeof window === "undefined") return "client";
  return window.localStorage.getItem(DEMO_ROLE_KEY) === "creator" ? "creator" : "client";
}

export function startDemoSession(email: string, name?: string, avatar?: string, role: DemoRole = getRoleForEmail(email)): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DEMO_SESSION_KEY, email.trim());
  window.localStorage.setItem(DEMO_ROLE_KEY, role);
  if (name?.trim()) window.localStorage.setItem(DEMO_NAME_KEY, name.trim());
  else window.localStorage.removeItem(DEMO_NAME_KEY);
  try {
    if (avatar) window.localStorage.setItem(DEMO_AVATAR_KEY, avatar);
    else window.localStorage.removeItem(DEMO_AVATAR_KEY);
  } catch {
    // quota localStorage : on continue sans avatar
  }
  try {
    const profiles = readProfiles();
    profiles[email.trim().toLowerCase()] = { name: name?.trim() || undefined, avatar: avatar || undefined };
    window.localStorage.setItem(DEMO_PROFILES_KEY, JSON.stringify(profiles));
  } catch {
    // quota localStorage : profil non mémorisé
  }
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function endDemoSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DEMO_SESSION_KEY);
  window.localStorage.removeItem(DEMO_NAME_KEY);
  window.localStorage.removeItem(DEMO_AVATAR_KEY);
  window.localStorage.removeItem(DEMO_ROLE_KEY);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

const knownFirstNames = [
  "ismail", "mehdi", "mohamed", "mohammed", "ahmed", "youssef", "omar", "ayoub", "hamza", "karim",
  "amine", "anas", "adam", "bilal", "rachid", "said", "samir", "hicham", "khalid", "yassine",
  "zakaria", "soufiane", "reda", "walid", "nabil", "tarik", "tariq", "ilyas", "marouane", "oussama",
  "imane", "sara", "salma", "fatima", "khadija", "aicha", "nadia", "meryem", "mariam", "hajar",
  "ghita", "houda", "loubna", "sofia", "sophie", "marcus", "camille", "kenji", "elena", "daniel",
].sort((a, b) => b.length - a.length);

const capitalize = (v: string) => (v ? v.charAt(0).toUpperCase() + v.slice(1).toLowerCase() : v);

/**
 * Prénom affiché : prénom saisi à l'inscription, sinon déduit de l'email
 * (ismailhansal3@… → Ismail : chiffres et séparateurs retirés, puis prénom courant reconnu en début d'adresse).
 */
export function getDisplayName(email: string | null, name: string | null): string {
  if (name?.trim()) return name.trim().split(/\s+/)[0];
  const local = (email ?? "").split("@")[0].split(/[._+-]/)[0].replace(/\d+/g, "").toLowerCase();
  if (!local) return "Moi";
  const known = knownFirstNames.find((n) => local.startsWith(n));
  return capitalize(known ?? local);
}

/**
 * Session de démo (frontend uniquement). `ready` reste false jusqu'à la lecture
 * du localStorage côté navigateur, pour éviter un flash au premier rendu.
 */
export function useDemoSession() {
  const [state, setState] = useState<{ ready: boolean; email: string | null; name: string | null; avatar: string | null; role: DemoRole }>({
    ready: false,
    email: null,
    name: null,
    avatar: null,
    role: "client",
  });

  useEffect(() => {
    const sync = () => setState({ ready: true, email: getDemoSessionEmail(), name: getDemoSessionName(), avatar: getDemoSessionAvatar(), role: getDemoSessionRole() });
    sync();
    window.addEventListener(AUTH_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(AUTH_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { ...state, isAuthenticated: !!state.email };
}