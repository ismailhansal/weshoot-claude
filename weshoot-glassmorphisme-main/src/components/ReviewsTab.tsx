import { Star } from "lucide-react";
import { useState } from "react";

import { formatDate, formatShortDate, type ClientOrder } from "@/lib/client-space";
import { getCreator } from "@/lib/creators";

function Stars({ value, onChange, size = "h-5 w-5" }: { value: number; onChange?: (v: number) => void; size?: string }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className="flex items-center gap-1" role={onChange ? "radiogroup" : "img"} aria-label={`Note : ${value} sur 5`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const star = <Star className={`${size} ${n <= shown ? "fill-primary text-primary" : "text-muted-foreground/40"} transition`} />;
        return onChange ? (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(n)}
            className="cursor-pointer rounded p-0.5 outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            {star}
          </button>
        ) : (
          <span key={n}>{star}</span>
        );
      })}
    </div>
  );
}

function ReviewCard({ order, onReview }: { order: ClientOrder; onReview: (id: string, rating: number, text: string) => void }) {
  const creator = getCreator(order.creatorId);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");

  return (
    <div className="glass rounded-3xl p-5 md:p-6">
      <div className="flex items-center gap-4">
        <img src={creator?.avatar} alt={creator?.name} className="h-14 w-14 shrink-0 rounded-full border-2 border-primary object-cover" />
        <div className="min-w-0">
          <div className="text-lg font-medium">{creator?.name}</div>
          <div className="text-xs text-muted-foreground">
            {order.category} — {formatShortDate(order.date)}
          </div>
        </div>
      </div>

      {order.review ? (
        <div className="mt-5 border-t border-white/10 pt-5">
          <div className="flex items-center justify-between gap-3">
            <Stars value={order.review.rating} />
            <span className="text-xs text-muted-foreground">Publié le {formatDate(order.review.date)}</span>
          </div>
          {order.review.text && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{order.review.text}</p>}
        </div>
      ) : (
        <div className="mt-5 space-y-4 border-t border-white/10 pt-5">
          <div>
            <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Ta note</div>
            <Stars value={rating} onChange={setRating} size="h-7 w-7" />
          </div>
          <textarea
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Raconte ton expérience avec ${creator?.name ?? "ce prestataire"}…`}
            className="w-full resize-y rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none backdrop-blur [color-scheme:dark] placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/25"
          />
          <button
            type="button"
            disabled={rating === 0}
            onClick={() => onReview(order.id, rating, text)}
            className="cursor-pointer h-11 rounded-xl bg-primary px-6 text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-glow transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            Publier l'avis
          </button>
        </div>
      )}
    </div>
  );
}

export function ReviewsTab({ orders, onReview }: { orders: ClientOrder[]; onReview: (id: string, rating: number, text: string) => void }) {
  const reviewable = orders.filter((o) => o.status === "validated");
  // Les prestations à noter en premier
  const sorted = [...reviewable].sort((a, b) => Number(!!a.review) - Number(!!b.review));

  if (sorted.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center text-sm text-muted-foreground backdrop-blur">
        Tu pourras noter un prestataire dès que tu auras validé sa prestation.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sorted.map((o) => (
        <ReviewCard key={o.id} order={o} onReview={onReview} />
      ))}
    </div>
  );
}
