// Mirrors specs/api-contract-spec.md response shapes.

export type TripType = "solo" | "couple" | "family" | "group";

export interface User {
  id: string;
  username: string;
}

export interface TripListItem {
  id: string;
  name: string;
  tripType: TripType;
  destinationCount: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

export interface DestinationSummary {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  dayCount: number;
}

export interface TripDetail {
  id: string;
  name: string;
  tripType: TripType;
  createdAt: string;
  updatedAt: string;
  destinations: DestinationSummary[];
}

export interface Activity {
  id: string;
  dayNumber: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface DestinationDetail extends DestinationSummary {
  activities: Activity[];
}
