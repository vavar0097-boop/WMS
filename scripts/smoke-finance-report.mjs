#!/usr/bin/env node

const DEFAULT_API_BASE_URL =
  "https://wms-production-23d1.up.railway.app/api";
const DEFAULT_ORIGIN = "https://app-ku.unaux.com";

function parseArgs(argv) {
  return argv.reduce(
    (result, arg) => {
      if (arg === "--sync-google") {
        result.syncGoogle = true;
        return result;
      }

      if (arg.startsWith("--month=")) {
        result.month = arg.slice("--month=".length);
        return result;
      }

      return result;
    },
    {
      month: process.env.WMS_REPORT_MONTH,
      syncGoogle: process.env.WMS_SYNC_GOOGLE === "true",
    },
  );
}

function currentMonth() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
  })
    .format(new Date())
    .slice(0, 7);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

class ApiClient {
  constructor({ baseUrl, origin }) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.origin = origin;
    this.cookie = "";
  }

  async request(method, path, body, okStatuses = [200, 201]) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        Origin: this.origin,
        "Content-Type": "application/json",
        ...(this.cookie ? { Cookie: this.cookie } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    this.storeCookies(response.headers.get("set-cookie"));

    const text = await response.text();
    let json = null;

    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = {
        raw: text,
      };
    }

    if (!okStatuses.includes(response.status)) {
      throw new Error(
        `${method} ${path} returned ${response.status}: ${JSON.stringify(json)}`,
      );
    }

    return json;
  }

  storeCookies(setCookie) {
    if (!setCookie) return;

    const parts = setCookie
      .split(/,(?=\s*\w+=)/)
      .map((part) => part.split(";")[0].trim());
    const jar = new Map(
      this.cookie
        .split(";")
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part) => part.split("=")),
    );

    for (const part of parts) {
      const separator = part.indexOf("=");

      if (separator > 0) {
        jar.set(part.slice(0, separator), part.slice(separator + 1));
      }
    }

    this.cookie = [...jar.entries()]
      .map(([key, value]) => `${key}=${value}`)
      .join("; ");
  }

  post(path, body) {
    return this.request("POST", path, body);
  }
}

function getData(payload) {
  return payload && typeof payload === "object" && "data" in payload
    ? payload.data
    : payload;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const month = args.month || currentMonth();
  const username = process.env.WMS_FINANCE_USERNAME || "uang1";
  const password = process.env.WMS_FINANCE_PASSWORD || "uang123";
  const client = new ApiClient({
    baseUrl: process.env.WMS_API_BASE_URL || DEFAULT_API_BASE_URL,
    origin: process.env.WMS_CLIENT_ORIGIN || DEFAULT_ORIGIN,
  });

  assert(/^\d{4}-\d{2}$/.test(month), "Month must use YYYY-MM format");

  await client.post("/auth/login", {
    username,
    password,
  });

  const response = await client.post("/finance/monthly-report", {
    month,
    sync_google: args.syncGoogle,
  });
  const report = getData(response);
  const sheetNames = Object.keys(report?.sheets ?? {});

  assert(response?.success === true, "Monthly report response was not successful");
  assert(report?.month === month, `Expected report month ${month}`);
  assert(sheetNames.length > 0, "Expected at least one daily sheet");
  assert(
    sheetNames.every((name) => /^\d{4}-\d{2}-\d{2}$/.test(name)),
    `Expected daily sheet names, got ${sheetNames.join(", ")}`,
  );
  assert(report?.summary, "Expected report summary");

  if (args.syncGoogle) {
    assert(
      report.google?.synced === true,
      `Expected Google sync success, got ${JSON.stringify(report.google)}`,
    );
    assert(
      Number(report.google?.sheet_count) === sheetNames.length,
      "Google sheet count did not match generated daily sheets",
    );
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        month,
        sync_google: args.syncGoogle,
        sheets: sheetNames,
        summary: report.summary,
        google: report.google,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(
    JSON.stringify(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      null,
      2,
    ),
  );
  process.exit(1);
});
