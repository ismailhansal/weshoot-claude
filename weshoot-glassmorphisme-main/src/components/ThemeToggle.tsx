import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const KEY = "weshoot.theme-test";

/**
 * Bouton de test : bascule entre le thème sombre (défaut) et un thème clair.
 * Le thème clair n'existe que tant que ce bouton est monté (dashboard client) : il est retiré en quittant la page.
 */
export function ThemeToggle() {
  const [light, setLight] = useState(false);

  useEffect(() => {
    try {
      const isLight = window.localStorage.getItem(KEY) === "light";
      setLight(isLight);
      document.documentElement.classList.toggle("light", isLight);
    } catch {
      // stockage indisponible
    }
    return () => document.documentElement.classList.remove("light");
  }, []);

  function toggle() {
    const next = !light;
    setLight(next);
    document.documentElement.classList.toggle("light", next);
    try {
      window.localStorage.setItem(KEY, next ? "light" : "dark");
    } catch {
      // stockage indisponible
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={light ? "Passer en mode sombre" : "Passer en mode clair"}
      title={light ? "Mode sombre" : "Mode clair"}
      className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-xl border border-border transition hover:bg-surface"
    >
      {light ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </button>
  );
}