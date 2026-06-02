import { CheckCircle2 } from "lucide-react";
import { cx, statusLabel, type Result } from "../types";

export function StatusBadge({
  availability,
}: {
  availability: Result["availability"];
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-[3px] px-2 py-[3px] text-[0.78rem] font-bold",
        availability === "available" && "bg-available-bg text-available",
        (availability === "taken" || availability === "error") &&
          "bg-taken-bg text-taken",
        (availability === "unchecked" || availability === "rate-limited") &&
          "bg-caution-bg text-caution"
      )}
    >
      {availability === "available" ? (
        <CheckCircle2 size={14} aria-hidden="true" />
      ) : null}
      {statusLabel(availability)}
    </span>
  );
}
