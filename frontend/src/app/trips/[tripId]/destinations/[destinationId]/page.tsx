"use client";

import { use } from "react";
import useSWR from "swr";
import { Grid, Column, Heading, Loading, InlineNotification } from "@carbon/react";
import ProtectedLayout from "@/components/ProtectedLayout";
import DayPlanner from "@/components/DayPlanner";
import { apiGet, apiPost, apiDelete } from "@/lib/apiClient";
import type { DestinationDetail } from "@/lib/types";

export default function DestinationPlannerPage({
  params,
}: {
  params: Promise<{ tripId: string; destinationId: string }>;
}) {
  const { tripId, destinationId } = use(params);
  const path = `/api/trips/${tripId}/destinations/${destinationId}`;

  const { data, error, isLoading, mutate } = useSWR(path, () =>
    apiGet<{ destination: DestinationDetail }>(path),
  );

  return (
    <ProtectedLayout>
      <Grid>
        <Column lg={12} md={8} sm={4}>
          {isLoading && <Loading withOverlay={false} />}
          {error && <InlineNotification kind="error" title="Couldn't load destination" hideCloseButton />}
          {data && (
            <>
              <Heading style={{ marginBottom: "0.25rem" }}>{data.destination.name}</Heading>
              <p style={{ marginBottom: "1.5rem" }}>
                {data.destination.startDate} – {data.destination.endDate}
              </p>
              <DayPlanner
                dayCount={data.destination.dayCount}
                activities={data.destination.activities}
                onAddActivity={async (dayNumber, description) => {
                  await apiPost(`${path}/activities`, { dayNumber, description });
                  mutate();
                }}
                onDeleteActivity={async (activityId) => {
                  await apiDelete(`${path}/activities/${activityId}`);
                  mutate();
                }}
              />
            </>
          )}
        </Column>
      </Grid>
    </ProtectedLayout>
  );
}
