"use client";

import { Stack } from "@carbon/react";
import { TrashCan } from "@carbon/icons-react";
import ActivityForm from "./ActivityForm";
import type { Activity } from "@/lib/types";

interface DayCardProps {
  activities: Activity[];
  onAddActivity: (description: string) => Promise<void>;
  onDeleteActivity: (activityId: string) => Promise<void>;
}

export default function DayCard({ activities, onAddActivity, onDeleteActivity }: DayCardProps) {
  return (
    <Stack gap={4}>
      {activities.length === 0 && <p>No activities yet.</p>}
      {activities.map((activity) => (
        <div key={activity.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{activity.description}</span>
          <button
            type="button"
            aria-label={`Delete ${activity.description}`}
            onClick={() => onDeleteActivity(activity.id)}
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <TrashCan size={16} />
          </button>
        </div>
      ))}
      <ActivityForm onSubmit={onAddActivity} />
    </Stack>
  );
}
