import { test, expect } from "@playwright/test";

// Unique username per test run to avoid state collisions between reruns
const u = () => `e2e_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

test.describe("Authentication flows", () => {
  test("health endpoint is reachable", async ({ request }) => {
    const res = await request.get("/health");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.status).toBe("ok");
  });

  test("unauthenticated root redirects to /auth", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/auth/);
    await expect(page.getByTestId("text-app-title")).toBeVisible();
  });

  test("register a new user and reach dashboard", async ({ page }) => {
    const username = u();
    await page.goto("/auth");

    // Switch to register tab
    await page.getByTestId("button-register-tab").click();

    await page.getByTestId("input-display-name").fill("E2E User");
    await page.getByTestId("input-username").fill(username);
    await page.getByTestId("input-password").fill("TestPass123!");
    await page.getByTestId("button-auth-submit").click();

    // Should land on dashboard
    await expect(page).toHaveURL("/");
    await expect(page.getByTestId("text-dashboard-title")).toBeVisible();
  });

  test("login with valid credentials", async ({ page }) => {
    const username = u();

    // Register first via API
    await page.request.post("/api/auth/register", {
      data: { username, password: "TestPass123!", displayName: "E2E" },
    });

    // Log out any existing session
    await page.request.post("/api/auth/logout");

    await page.goto("/auth");
    await expect(page.getByTestId("button-login-tab")).toBeVisible();

    await page.getByTestId("input-username").fill(username);
    await page.getByTestId("input-password").fill("TestPass123!");
    await page.getByTestId("button-auth-submit").click();

    await expect(page).toHaveURL("/");
    await expect(page.getByTestId("text-dashboard-title")).toBeVisible();
  });

  test("login with wrong password shows error", async ({ page }) => {
    const username = u();
    await page.request.post("/api/auth/register", {
      data: { username, password: "CorrectPass1!", displayName: "E2E" },
    });
    await page.request.post("/api/auth/logout");

    await page.goto("/auth");
    await page.getByTestId("input-username").fill(username);
    await page.getByTestId("input-password").fill("WrongPass999!");
    await page.getByTestId("button-auth-submit").click();

    await expect(page.getByTestId("text-auth-error")).toBeVisible();
    await expect(page).toHaveURL(/\/auth/);
  });

  test("logout clears session and redirects to /auth", async ({ page }) => {
    const username = u();
    await page.request.post("/api/auth/register", {
      data: { username, password: "TestPass123!", displayName: "E2E" },
    });

    // Navigate directly — session cookie set by register
    await page.goto("/");
    await expect(page.getByTestId("text-dashboard-title")).toBeVisible();

    // Logout via API and re-navigate
    await page.request.post("/api/auth/logout");
    await page.goto("/");
    await expect(page).toHaveURL(/\/auth/);
  });

  test("duplicate username registration returns error", async ({ page }) => {
    const username = u();
    await page.request.post("/api/auth/register", {
      data: { username, password: "TestPass123!", displayName: "First" },
    });
    await page.request.post("/api/auth/logout");

    await page.goto("/auth");
    await page.getByTestId("button-register-tab").click();
    await page.getByTestId("input-display-name").fill("Second");
    await page.getByTestId("input-username").fill(username);
    await page.getByTestId("input-password").fill("AnotherPass1!");
    await page.getByTestId("button-auth-submit").click();

    await expect(page.getByTestId("text-auth-error")).toBeVisible();
  });
});
