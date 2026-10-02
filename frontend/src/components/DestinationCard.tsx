"use client";

import { useState } from "react";
import { ClickableTile } from "@carbon/react";
import { TrashCan } from "@carbon/icons-react";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import type { DestinationSummary } from "@/lib/types";

interface DestinationCardProps {
  destination: DestinationSummary;
  onOpen: () => void;
  onDelete: () => Promise<void>;
}

export default function DestinationCard({ destination, onOpen, onDelete }: DestinationCardProps) {
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      <ClickableTile
        onClick={onOpen}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <div>
          <h5>{destination.name}</h5>
          <p>
            {destination.startDate} – {destination.endDate} ({destination.dayCount} day
            {destination.dayCount === 1 ? "" : "s"})
          </p>
        </div>
        <button
          type="button"
          aria-label={`Delete ${destination.name}`}
          onClick={(e) => {
            e.stopPropagation();
            setConfirming(true);
          }}
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          <TrashCan size={20} />
        </button>
      </ClickableTile>
      <ConfirmDeleteModal
        open={confirming}
        heading={`Delete "${destination.name}"?`}
        onCancel={() => setConfirming(false)}
        onConfirm={async () => {
          setConfirming(false);
          await onDelete();
        }}
      >
        <p>This will also delete all of its activities. This can&apos;t be undone.</p>
      </ConfirmDeleteModal>
    </>
  );
}
