const BASE_URL = process.env.VERIFY_URL ?? "http://localhost:7000";
const MIN_HTML_LENGTH = 1000;
const REQUIRED_TEXT = "TopMox";

const routes = [
  { path: "/", kind: "html" },
  { path: "/global-tutoring", kind: "html" },
  { path: "/subjects", kind: "html" },
  { path: "/subjects/mathematics", kind: "html" },
  { path: "/subjects/english", kind: "html" },
  { path: "/subjects/science", kind: "html" },
  { path: "/subjects/reading-comprehension", kind: "html" },
  { path: "/exam-prep", kind: "html" },
  { path: "/pricing", kind: "html" },
  { path: "/about", kind: "html" },
  { path: "/faq", kind: "html" },
  { path: "/contact", kind: "html" },
  { path: "/locations", kind: "html" },
  { path: "/locations/nigeria", kind: "html" },
  { path: "/locations/united-states", kind: "html" },
  { path: "/locations/canada", kind: "html" },
  { path: "/locations/australia", kind: "html" },
  { path: "/locations/united-kingdom", kind: "html" },
  { path: "/locations/europe", kind: "html" },
  { path: "/locations/uae", kind: "html" },
  { path: "/resources", kind: "html" },
  { path: "/resources/how-online-tutoring-works-at-topmox", kind: "html" },
  { path: "/login", kind: "html" },
  { path: "/register", kind: "html" },
  { path: "/forgot-password", kind: "html" },
  { path: "/admin", kind: "html" },
  { path: "/admin/assessments", kind: "html" },
  { path: "/admin/payments", kind: "html" },
  { path: "/admin/enrollments", kind: "html" },
  { path: "/admin/lessons", kind: "html" },
  { path: "/admin/homework", kind: "html" },
  { path: "/admin/reports", kind: "html" },
  { path: "/admin/support", kind: "html" },
  { path: "/admin/resources", kind: "html" },
  { path: "/admin/notifications", kind: "html" },
  { path: "/parent", kind: "html" },
  { path: "/parent/onboarding", kind: "html" },
  { path: "/parent/children", kind: "html" },
  { path: "/parent/assessments", kind: "html" },
  { path: "/parent/enrollments", kind: "html" },
  { path: "/parent/payments", kind: "html" },
  { path: "/parent/lessons", kind: "html" },
  { path: "/parent/homework", kind: "html" },
  { path: "/parent/reports", kind: "html" },
  { path: "/parent/support", kind: "html" },
  { path: "/parent/notifications", kind: "html" },
  { path: "/tutor", kind: "html" },
  { path: "/tutor/lessons", kind: "html" },
  { path: "/tutor/homework", kind: "html" },
  { path: "/tutor/reports", kind: "html" },
  { path: "/tutor/notifications", kind: "html" },
  { path: "/api/health", kind: "json" },
  { path: "/api/geo", kind: "geo-json" }
];

function fail(message) {
  console.error(`Site verification failed: ${message}`);
  process.exit(1);
}

async function fetchOk(url, context) {
  let response;

  try {
    response = await fetch(url, { redirect: "follow" });
  } catch (error) {
    fail(`${context} request error for ${url}: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (!response.ok) {
    fail(`${context} returned status ${response.status} for ${url}`);
  }

  return response;
}

function extractStaticAssets(html) {
  const matches = html.match(/\/_next\/static\/[^\s"'<>]+/g) ?? [];
  return [...new Set(matches)];
}

async function verifyHtmlRoute(route) {
  const url = `${BASE_URL.replace(/\/$/, "")}${route}`;
  const response = await fetchOk(url, `Route ${route}`);
  const html = await response.text();

  if (html.length < MIN_HTML_LENGTH) {
    fail(`route ${route} returned very short HTML (${html.length} chars).`);
  }

  if (!html.includes(REQUIRED_TEXT)) {
    fail(`route ${route} does not contain "${REQUIRED_TEXT}".`);
  }

  if (/Â|�/.test(html)) {
    fail(`route ${route} contains visible mojibake or replacement glyphs.`);
  }

  return html;
}

async function verifyJsonRoute(route) {
  const url = `${BASE_URL.replace(/\/$/, "")}${route}`;
  const response = await fetchOk(url, `Route ${route}`);
  const payload = await response.json();

  if (!payload || typeof payload !== "object") {
    fail(`route ${route} did not return a JSON object.`);
  }

  if (!["ok", "degraded"].includes(payload.status)) {
    fail(`route ${route} returned unexpected health status "${payload.status}".`);
  }

  if (!payload.timestamp || !payload.app) {
    fail(`route ${route} is missing app or timestamp health metadata.`);
  }
}

async function verifyGeoJsonRoute(route) {
  const url = `${BASE_URL.replace(/\/$/, "")}${route}`;
  const response = await fetchOk(url, `Route ${route}`);
  const payload = await response.json();

  if (!payload || typeof payload !== "object") {
    fail(`route ${route} did not return a JSON object.`);
  }

  if (!payload.region?.code || !payload.region?.currency) {
    fail(`route ${route} is missing safe region metadata.`);
  }

  if (payload.region.code !== "nigeria" || payload.region.currency !== "NGN") {
    fail(
      `route ${route} should default to Nigeria/NGN, received ${payload.region.code}/${payload.region.currency}.`
    );
  }

  if (!payload.source) {
    fail(`route ${route} is missing detection source metadata.`);
  }

  if (typeof payload.flutterwaveEnabled !== "boolean") {
    fail(`route ${route} is missing Flutterwave availability metadata.`);
  }

  if (typeof payload.manualPaymentEnabled !== "boolean") {
    fail(`route ${route} is missing manual payment availability metadata.`);
  }
}

async function main() {
  const homepageHtml = await verifyHtmlRoute("/");

  for (const route of routes.slice(1)) {
    if (route.kind === "json") {
      await verifyJsonRoute(route.path);
      continue;
    }

    if (route.kind === "geo-json") {
      await verifyGeoJsonRoute(route.path);
      continue;
    }

    await verifyHtmlRoute(route.path);
  }

  const staticAssets = extractStaticAssets(homepageHtml);
  if (staticAssets.length === 0) {
    fail("no /_next/static assets were found in homepage HTML.");
  }

  const assetsToCheck = staticAssets.slice(0, 5);
  for (const assetPath of assetsToCheck) {
    const assetUrl = `${BASE_URL.replace(/\/$/, "")}${assetPath}`;
    await fetchOk(assetUrl, `Static asset ${assetPath}`);
  }

  console.log(
    `Site verification passed: checked ${routes.length} routes and ${assetsToCheck.length} static asset(s) at ${BASE_URL}.`
  );
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
