# Goal Spec

## Project Name
Evergreen Travels


## Problem Statement
<!-- What problem are we solving? Who is this for? -->
Travelers planning a trip to a destination typically scatter their day-by-day plans across notes apps, spreadsheets, or chat threads, making it hard to keep an itinerary organized, share it, or reference it while traveling. This app gives travelers a single place to plan their trip day by day and export a clean itinerary.

## Target Users
Any traveler planning a trip, regardless of who they're traveling with — solo, as a couple, with family, or with a group of friends.

## Core Value Proposition
<!-- Why would someone use this over alternatives? -->
Unlike a notes app or spreadsheet, this app understands the shape of a trip — destinations, dates, and days — so travelers get a structured, day-by-day itinerary they can build incrementally and export cleanly, instead of free-form text they have to format themselves.
- Responsive web application (usable on both desktop and mobile browsers — no native mobile app)
- Users can sign up (username + password) and log in through login/signup screens
- Users can create a new trip with a name and a trip type (solo, couple, family, group of friends)
- Users can add one or more destinations to a trip, each with its own start date and end date
- Users can open a destination and enter activities day by day, from Day 1 through Day N (derived from that destination's start/end dates)
- Users can view a list of their created trips
- Users can export a finalized trip's itinerary — across all of its destinations — as a PDF

## Primary Use Cases
<!-- List the top 3-5 things a user should be able to do -->
- As a user, I want to create a trip and add one or more destinations so that I can see my whole itinerary in one place.
- For each destination, I want to set a start and end date and plan my activities in a day-by-day manner within that range.
- After the plan is finalized, I want to export the itinerary as a PDF.

## Out of Scope
<!-- Explicitly list what this project will NOT do (v1) -->
- Auto-populating a day's activities from a suggestions dropdown/picker
- Auto-populating activity suggestions based on trip type
- Reordering destinations within a trip after creation
- Overlap/gap validation between destination date ranges (e.g. warning if two destinations share dates)
- Collaborative/shared trips (multiple users editing the same trip)

## Success Criteria
<!-- How do we know this is working / done? -->
- A user is able to log in
- A user is able to create a trip and add one or more destinations to it
- A user is able to see their created trips
- A user is able to plan day-by-day activities for each destination in a trip
- A user is able to export a trip's itinerary as a PDF

## Constraints
<!-- Timeline, budget, tech constraints, team size, etc. -->
- Timeline: 2 weekends
- Team Size: 1 person
- Target Platform: Web only, built responsively so it also works on mobile browsers (no native mobile app)

## Glossary
<!-- Terms used across this spec and the frontend/backend/api-contract specs -->
| Term | Definition |
|------|------------|
| Trip | A journey a user plans, made up of one or more Destinations, a Trip Type, and a name. Owned by a single user. |
| Destination | A single place within a Trip (e.g. a city), with its own start date and end date. Holds the day-by-day plan for that leg of the Trip. |
| Trip Type | A category describing who the Trip is for: Solo, Couple, Family, or Group of Friends. |
| Day | A single day within a Destination's date range, numbered Day 1 through Day N based on that Destination's start/end dates. |
| Activity | A single planned item a user adds to a specific Day (e.g. "Visit the Louvre, 10am"). |
| Itinerary | The full day-by-day plan for a Trip, spanning all of its Destinations' Days and Activities. |
| Finalized Trip | A Trip whose Itinerary the user considers complete and ready to export. |
| Export (PDF) | Generating a printable, shareable PDF document of a Trip's Itinerary. |
| User / Traveler | A person who has signed up and logged in to create and manage their own Trips. |

## Open Questions

