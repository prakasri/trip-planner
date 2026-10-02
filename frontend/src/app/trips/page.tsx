"use client";

import useSWR from "swr";
import { useRouter } from "next/navigation";
import { Grid, Column, Heading, Button, Stack, Loading, InlineNotification } from "@carbon/react";
import { Add } from "@carbon/icons-react";
import ProtectedLayout from "@/components/ProtectedLayout";
import TripCard from "@/components/TripCard";
import { apiGet, apiDelete } from "@/lib/apiClient";
import type { TripListItem } from "@/lib/types";

export default function TripsPage() {
  const router = useRouter();
  const { data, error, isLoading, mutate } = useSWR("/api/trips", () =>
    apiGet<{ trips: TripListItem[] }>("/api/trips"),
  );

  return (
    <ProtectedLayout>
      <Grid>
        <Column lg={12} md={8} sm={4}>
          <Stack gap={5}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Heading>Your trips</Heading>
              <Button renderIcon={Add} onClick={() => router.push("/trips/new")}>
                New trip
              </Button>
            </div>
            {isLoading && <Loading withOverlay={false} />}
            {error && <InlineNotification kind="error" title="Couldn't load trips" hideCloseButton />}
            {data?.trips.length === 0 && <p>No trips yet — create your first one.</p>}
            {data?.trips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onOpen={() => router.push(`/trips/${trip.id}`)}
                onDelete={async () => {
                  await apiDelete(`/api/trips/${trip.id}`);
                  mutate();
                }}
              />
            ))}
          </Stack>
        </Column>
      </Grid>
    </ProtectedLayout>
  );
}
