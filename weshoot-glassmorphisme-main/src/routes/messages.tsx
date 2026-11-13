import { createFileRoute, redirect } from "@tanstack/react-router";

// Les messages vivent désormais dans le dashboard : on garde cette URL pour les anciens liens.
export const Route = createFileRoute("/messages")({
  validateSearch: (search: Record<string, unknown>): { order?: string } => ({
    ...(typeof search.order === "string" ? { order: search.order } : {}),
  }),
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/dashboard", search: { tab: "messages", ...(search.order ? { order: search.order } : {}) }, replace: true });
  },
});
