"use client";

import { useState } from "react";
import { ClickableTile, Tag } from "@carbon/react";
import { TrashCan } from "@carbon/icons-react";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import type { TripListItem } from "@/lib/types";

const tripTypeLabels: Record<TripListItem["tripType"], string> = {
  solo: "Solo",
  couple: "Couple",
  family: "Family",
  group: "Group of friends",
};

interface TripCardProps {
  trip: TripListItem;
  onOpen: () => void;
  onDelete: () => Promise<void>;
}

export default function TripCard({ trip, onOpen, onDelete }: TripCardProps) {
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      <ClickableTile
        onClick={onOpen}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <div>
          <h4>{trip.name}</h4>
          <Tag type="blue">{tripTypeLabels[trip.tripType]}</Tag>
          <p>
            {trip.startDate && trip.endDate ? `${trip.startDate} – ${trip.endDate}` : "No destinations yet"}
            {" · "}
            {trip.destinationCount} destination{trip.destinationCount === 1 ? "" : "s"}
          </p>
        </div>
        <button
          type="button"
          aria-label={`Delete ${trip.name}`}
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
        heading={`Delete "${trip.name}"?`}
        onCancel={() => setConfirming(false)}
        onConfirm={async () => {
          setConfirming(false);
          await onDelete();
        }}
      >
        <p>This will also delete all of its destinations and activities. This can&apos;t be undone.</p>
      </ConfirmDeleteModal>
    </>
  );
}
