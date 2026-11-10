import { useEffect, useState } from "react";

export type Booking = {
  ref: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  offerName: string;
  price: number;
  day: number;
  time: string;
  city: string;
  location: string;
  notes: string;
  contactName?: string;
  contactEmail?: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
  date?: string;
  flexibleDate?: string;
  serviceType?: string;
  requestDescription?: string;
};

const BOOKINGS_KEY = "weshoot.bookings";
const SAVED_KEY = "weshoot.saved";
const EVENT = "weshoot:store";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(EVENT));
}

function useStored<T>(key: string, fallback: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(fallback);

  useEffect(() => {
    const sync = () => setValue(read<T>(key, fallback));
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [value, (v: T) => write(key, v)];
}

export function useBookings() {
  const [bookings, setBookings] = useStored<Booking[]>(BOOKINGS_KEY, []);

  return {
    bookings,
    addBooking(b: Booking) {
      setBookings([b, ...read<Booking[]>(BOOKINGS_KEY, [])]);
    },
    cancelBooking(ref: string) {
      setBookings(
        read<Booking[]>(BOOKINGS_KEY, []).map((b) => (b.ref === ref ? { ...b, status: "cancelled" as const } : b)),
      );
    },
  };
}

export function useSaved() {
  const [saved, setSaved] = useStored<string[]>(SAVED_KEY, []);

  return {
    saved,
    isSaved: (id: string) => saved.includes(id),
    toggleSaved(id: string) {
      const current = read<string[]>(SAVED_KEY, []);
      setSaved(current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
    },
  };
}

export function newRef() {
  return "WS-" + Math.random().toString(36).slice(2, 7).toUpperCase();
}