type LogoProps = {
  /** Classes de taille du texte (ex. "text-2xl"). */
  className?: string;
  /** "dark" : fond sombre, lettres en blanc. "light" : fond clair, lettres en noir pour rester lisible. */
  tone?: "dark" | "light";
};

/** Logo WeShoot : « wesh » en blanc, « oo » en orange, « t » en blanc, sans pastille. */
export function Logo({ className = "text-2xl", tone = "dark" }: LogoProps) {
  const base = tone === "light" ? "text-slate-900" : "text-foreground";
  return (
    <span className={`text-display ${className}`}>
      <span className={base}>wesh</span>
      <span className="text-primary">oo</span>
      <span className={base}>t</span>
    </span>
  );
}
