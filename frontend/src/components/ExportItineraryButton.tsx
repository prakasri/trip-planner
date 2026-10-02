"use client";

import { useState } from "react";
import { Button, InlineLoading } from "@carbon/react";
import { Download } from "@carbon/icons-react";
import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
import { apiGet } from "@/lib/apiClient";
import type { DestinationDetail, DestinationSummary } from "@/lib/types";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11 },
  tripName: { fontSize: 20, marginBottom: 16 },
  destinationName: { fontSize: 15, marginTop: 16, marginBottom: 4 },
  destinationDates: { fontSize: 10, color: "#525252", marginBottom: 8 },
  dayHeading: { fontSize: 12, marginTop: 8, marginBottom: 2, fontWeight: 700 },
  activity: { marginLeft: 12, marginBottom: 2 },
});

function ItineraryDocument({
  tripName,
  destinations,
}: {
  tripName: string;
  destinations: DestinationDetail[];
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.tripName}>{tripName}</Text>
        {destinations.map((destination) => (
          <View key={destination.id}>
            <Text style={styles.destinationName}>{destination.name}</Text>
            <Text style={styles.destinationDates}>
              {destination.startDate} – {destination.endDate}
            </Text>
            {Array.from({ length: destination.dayCount }, (_, i) => i + 1).map((dayNumber) => (
              <View key={dayNumber}>
                <Text style={styles.dayHeading}>Day {dayNumber}</Text>
                {destination.activities
                  .filter((a) => a.dayNumber === dayNumber)
                  .map((a) => (
                    <Text key={a.id} style={styles.activity}>
                      • {a.description}
                    </Text>
                  ))}
              </View>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
}

interface ExportItineraryButtonProps {
  tripId: string;
  tripName: string;
  destinations: DestinationSummary[];
}

export default function ExportItineraryButton({ tripId, tripName, destinations }: ExportItineraryButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    setIsExporting(true);
    try {
      const details = await Promise.all(
        destinations.map((d) =>
          apiGet<{ destination: DestinationDetail }>(
            `/api/trips/${tripId}/destinations/${d.id}`,
          ).then((r) => r.destination),
        ),
      );
      const blob = await pdf(<ItineraryDocument tripName={tripName} destinations={details} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${tripName}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  }

  if (isExporting) {
    return <InlineLoading description="Preparing PDF…" />;
  }

  return (
    <Button kind="tertiary" renderIcon={Download} onClick={handleExport} disabled={destinations.length === 0}>
      Export as PDF
    </Button>
  );
}
