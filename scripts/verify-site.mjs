const BASE_URL = process.env.VERIFY_URL ?? "http://localhost:7000";
const MIN_HTML_LENGTH = 1000;
const REQUIRED_TEXT = "TopMox";

const routes = [
  { path: "/", kind: "html" },
  { path: "/global-tutoring", kind: "html" },
  { path: "/subjects", kind: "html" },
  { path: "/pricing", kind: "html" },
  { path: "/about", kind: "html" },
  { path: "/faq", kind: "html" },
  { path: "/contact", kind: "html" },
  { path: "/resources", kind: "html" },
  { path: "/login", kind: "html" },
  { path: "/register", kind: "html" },
  { path: "/forgot-password", kind: "html" },
  { path: "/admin", kind: "html" },
  { path: "/parent", kind: "html" },
  { path: "/tutor", kind: "html" },
  { path: "/api/health", kind: "json" }
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

async function main() {
  const homepageHtml = await verifyHtmlRoute("/");

  for (const route of routes.slice(1)) {
    if (route.kind === "json") {
      await verifyJsonRoute(route.path);
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
