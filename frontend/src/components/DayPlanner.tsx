"use client";

import { Accordion, AccordionItem } from "@carbon/react";
import DayCard from "./DayCard";
import type { Activity } from "@/lib/types";

interface DayPlannerProps {
  dayCount: number;
  activities: Activity[];
  onAddActivity: (dayNumber: number, description: string) => Promise<void>;
  onDeleteActivity: (activityId: string) => Promise<void>;
}

export default function DayPlanner({ dayCount, activities, onAddActivity, onDeleteActivity }: DayPlannerProps) {
  const days = Array.from({ length: dayCount }, (_, i) => i + 1);

  return (
    <Accordion>
      {days.map((dayNumber) => (
        <AccordionItem key={dayNumber} title={`Day ${dayNumber}`} open={dayNumber === 1}>
          <DayCard
            activities={activities.filter((a) => a.dayNumber === dayNumber)}
            onAddActivity={(description) => onAddActivity(dayNumber, description)}
            onDeleteActivity={onDeleteActivity}
          />
        </AccordionItem>
      ))}
    </Accordion>
  );
}
