"use client";

import { useRouter } from "next/navigation";
import { Grid, Column, Heading } from "@carbon/react";
import ProtectedLayout from "@/components/ProtectedLayout";
import TripForm from "@/components/TripForm";
import { apiPost } from "@/lib/apiClient";
import type { TripType } from "@/lib/types";

export default function NewTripPage() {
  const router = useRouter();

  async function handleSubmit(values: { name: string; tripType: TripType }) {
    const { trip } = await apiPost<{ trip: { id: string } }>("/api/trips", values);
    router.push(`/trips/${trip.id}`);
  }

  return (
    <ProtectedLayout>
      <Grid>
        <Column lg={6} md={4} sm={4}>
          <Heading style={{ marginBottom: "1.5rem" }}>New trip</Heading>
          <TripForm submitLabel="Create trip" onSubmit={handleSubmit} />
        </Column>
      </Grid>
    </ProtectedLayout>
  );
}
