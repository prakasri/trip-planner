"use client";

import { use, useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { Grid, Column, Heading, Tag, Button, Stack, Loading, InlineNotification } from "@carbon/react";
import { Add, TrashCan } from "@carbon/icons-react";
import ProtectedLayout from "@/components/ProtectedLayout";
import DestinationCard from "@/components/DestinationCard";
import DestinationForm, { type DestinationFormValues } from "@/components/DestinationForm";
import ExportItineraryButton from "@/components/ExportItineraryButton";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import { apiGet, apiPost, apiDelete } from "@/lib/apiClient";
import type { TripDetail } from "@/lib/types";

export default function TripDetailPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = use(params);
  const router = useRouter();
  const [addingDestination, setAddingDestination] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const { data, error, isLoading, mutate } = useSWR(`/api/trips/${tripId}`, () =>
    apiGet<{ trip: TripDetail }>(`/api/trips/${tripId}`),
  );

  return (
    <ProtectedLayout>
      <Grid>
        <Column lg={12} md={8} sm={4}>
          {isLoading && <Loading withOverlay={false} />}
          {error && <InlineNotification kind="error" title="Couldn't load trip" hideCloseButton />}
          {data && (
            <Stack gap={6}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <Heading>{data.trip.name}</Heading>
                  <Tag type="blue">{data.trip.tripType}</Tag>
                </div>
                <Stack orientation="horizontal" gap={3}>
                  <ExportItineraryButton
                    tripId={tripId}
                    tripName={data.trip.name}
                    destinations={data.trip.destinations}
                  />
                  <Button kind="danger--ghost" renderIcon={TrashCan} onClick={() => setConfirmingDelete(true)}>
                    Delete trip
                  </Button>
                </Stack>
              </div>

              <Stack gap={4}>
                <Heading>Destinations</Heading>
                {data.trip.destinations.map((destination) => (
                  <DestinationCard
                    key={destination.id}
                    destination={destination}
                    onOpen={() => router.push(`/trips/${tripId}/destinations/${destination.id}`)}
                    onDelete={async () => {
                      await apiDelete(`/api/trips/${tripId}/destinations/${destination.id}`);
                      mutate();
                    }}
                  />
                ))}

                {addingDestination ? (
                  <DestinationForm
                    onCancel={() => setAddingDestination(false)}
                    onSubmit={async (values: DestinationFormValues) => {
                      await apiPost(`/api/trips/${tripId}/destinations`, values);
                      setAddingDestination(false);
                      mutate();
                    }}
                  />
                ) : (
                  <Button kind="ghost" renderIcon={Add} onClick={() => setAddingDestination(true)}>
                    Add destination
                  </Button>
                )}
              </Stack>
            </Stack>
          )}
        </Column>
      </Grid>

      <ConfirmDeleteModal
        open={confirmingDelete}
        heading={`Delete "${data?.trip.name}"?`}
        onCancel={() => setConfirmingDelete(false)}
        onConfirm={async () => {
          setConfirmingDelete(false);
          await apiDelete(`/api/trips/${tripId}`);
          router.push("/trips");
        }}
      >
        <p>This will also delete all of its destinations and activities. This can&apos;t be undone.</p>
      </ConfirmDeleteModal>
    </ProtectedLayout>
  );
}
