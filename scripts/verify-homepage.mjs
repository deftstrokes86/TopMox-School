const BASE_URL = process.env.VERIFY_URL ?? "http://localhost:4000";
const MIN_HTML_LENGTH = 2000;
const REQUIRED_TEXT = "TopMox";

function fail(message) {
  console.error(`Homepage verification failed: ${message}`);
  process.exit(1);
}

async function fetchOrFail(url, context) {
  let response;
  try {
    response = await fetch(url, {
      method: "GET",
      redirect: "follow"
    });
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

async function main() {
  const homepageUrl = `${BASE_URL.replace(/\/$/, "")}/`;
  const homepageResponse = await fetchOrFail(homepageUrl, "Homepage");
  const html = await homepageResponse.text();

  if (html.length < MIN_HTML_LENGTH) {
    fail(`homepage HTML is too short (${html.length} chars). Expected at least ${MIN_HTML_LENGTH}.`);
  }

  if (!html.includes(REQUIRED_TEXT)) {
    fail(`homepage HTML does not contain "${REQUIRED_TEXT}".`);
  }

  const staticAssets = extractStaticAssets(html);
  if (staticAssets.length === 0) {
    fail("no /_next/static assets were found in homepage HTML.");
  }

  const assetsToCheck = staticAssets.slice(0, 3);
  for (const assetPath of assetsToCheck) {
    const assetUrl = `${BASE_URL.replace(/\/$/, "")}${assetPath}`;
    const assetResponse = await fetchOrFail(assetUrl, "Static asset");

    if (assetResponse.status >= 400) {
      fail(`static asset ${assetPath} returned status ${assetResponse.status}.`);
    }
  }

  console.log(
    `Homepage verification passed: status 200, HTML length ${html.length}, contains "${REQUIRED_TEXT}", checked ${assetsToCheck.length} static asset(s).`
  );
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
