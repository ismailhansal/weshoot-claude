import { createFileRoute, redirect } from "@tanstack/react-router";

// « Mes réservations » est intégré au dashboard : on garde cette URL pour les anciens liens.
export const Route = createFileRoute("/bookings")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard", search: { tab: "reservations" }, replace: true });
  },
});
