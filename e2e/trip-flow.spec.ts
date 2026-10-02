import { test, expect, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";

// Full user journeys in a real browser, against real built apps + a real
// database — this is the layer that caught the DatePicker `pattern`
// mismatch and the next/font Turbopack failure during manual testing;
// jsdom-based component tests can't reproduce either (native HTML
// constraint validation, and the bundler itself).

function uniqueUsername() {
  return `e2e_${randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

async function signUp(page: Page) {
  const username = uniqueUsername();
  await page.goto("/signup");
  await page.getByLabel("Username").fill(username);
  await page.getByRole("textbox", { name: "Password" }).fill("password123");
  await page.getByRole("button", { name: "Sign up" }).click();
  await expect(page).toHaveURL(/\/trips$/);
  return username;
}

async function createTrip(page: Page, name: string, tripType: string) {
  await page.getByRole("button", { name: "New trip" }).click();
  await page.getByLabel("Trip name").fill(name);
  await page.getByRole("combobox", { name: "Trip type" }).click();
  await page.getByText(tripType).click();
  await page.getByRole("button", { name: "Create trip" }).click();
  // Not /\/trips\/[^/]+$/ — that also matches /trips/new itself ("new" has
  // no slashes), which would silently mask a failed submission.
  await expect(page).toHaveURL(/\/trips\/[0-9a-f-]{36}$/);
}

async function addDestination(page: Page, name: string, startDate: string, endDate: string) {
  await page.getByRole("button", { name: "Add destination" }).click();
  await page.getByLabel("Destination name").fill(name);
  await page.getByLabel("Start date").fill(startDate);
  await page.getByLabel("End date").fill(endDate);
  await page.keyboard.press("Escape"); // close the calendar popup before submitting
  await page.getByRole("button", { name: "Add destination" }).click();
}

test("sign up, plan a trip day-by-day, export, and delete everything", async ({ page }) => {
  await signUp(page);
  await expect(page.getByText("No trips yet")).toBeVisible();

  await createTrip(page, "Spring in Japan", "Couple");
  await expect(page.getByRole("heading", { name: "Spring in Japan" })).toBeVisible();

  const exportButton = page.getByRole("button", { name: "Export as PDF" });
  await expect(exportButton).toBeDisabled();

  // Exercises the real DatePicker + native HTML validation path.
  await addDestination(page, "Tokyo", "2027-04-01", "2027-04-04");
  await expect(page.getByText("2027-04-01 – 2027-04-04 (4 days)")).toBeVisible();
  await expect(exportButton).toBeEnabled();

  // --- Plan activities ---
  await page.getByText("Tokyo", { exact: true }).click();
  await expect(page).toHaveURL(/\/destinations\/[^/]+$/);
  await expect(page.getByText("Day 1")).toBeVisible();
  await expect(page.getByText("Day 4")).toBeVisible();

  const [day1ActivityInput] = await page.getByPlaceholder("Add an activity…").all();
  await day1ActivityInput.fill("Arrive, check into hotel");
  await page.getByRole("button", { name: "Add" }).first().click();
  await expect(page.getByText("Arrive, check into hotel")).toBeVisible();

  // --- Export as PDF ---
  await page.goBack();
  const downloadPromise = page.waitForEvent("download");
  await exportButton.click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("Spring in Japan.pdf");

  // --- Delete the destination ---
  await page.getByRole("button", { name: "Delete Tokyo" }).click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page.getByText("Tokyo", { exact: true })).not.toBeVisible();
  await expect(exportButton).toBeDisabled();

  // --- Delete the trip ---
  await page.getByRole("button", { name: "Delete trip" }).click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page).toHaveURL(/\/trips$/);
  await expect(page.getByText("No trips yet")).toBeVisible();

  // --- Logout and confirm the protected redirect ---
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/trips");
  await expect(page).toHaveURL(/\/login$/);
});

test("supports multiple destinations on one trip and deleting a single activity", async ({ page }) => {
  await signUp(page);
  await createTrip(page, "Grand tour", "Group of friends");

  await addDestination(page, "Tokyo", "2027-04-01", "2027-04-03");
  await addDestination(page, "Kyoto", "2027-04-04", "2027-04-05");
  await expect(page.getByText("2027-04-01 – 2027-04-03 (3 days)")).toBeVisible();
  await expect(page.getByText("2027-04-04 – 2027-04-05 (2 days)")).toBeVisible();

  await page.getByText("Kyoto", { exact: true }).click();
  await expect(page).toHaveURL(/\/destinations\/[^/]+$/);
  await expect(page.getByRole("heading", { name: "Kyoto" })).toBeVisible();
  const [day1Input] = await page.getByPlaceholder("Add an activity…").all();
  await day1Input.fill("Visit Fushimi Inari");
  await page.getByRole("button", { name: "Add" }).first().click();
  await expect(page.getByText("Visit Fushimi Inari")).toBeVisible();

  await page.getByRole("button", { name: "Delete Visit Fushimi Inari" }).click();
  await expect(page.getByText("Visit Fushimi Inari")).not.toBeVisible();
  await expect(page.getByText("No activities yet.").first()).toBeVisible();
});

test("shows an error rather than someone else's trip", async ({ browser }) => {
  const ownerContext = await browser.newContext();
  const ownerPage = await ownerContext.newPage();
  await signUp(ownerPage);
  await createTrip(ownerPage, "Private trip", "Solo");
  const tripUrl = ownerPage.url();
  await ownerContext.close();

  const strangerContext = await browser.newContext();
  const strangerPage = await strangerContext.newPage();
  await signUp(strangerPage);
  await strangerPage.goto(tripUrl);
  await expect(strangerPage.getByText("Couldn't load trip")).toBeVisible();
  await strangerContext.close();
});
