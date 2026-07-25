const UPSTREAM_ORIGIN = Buffer.from(
  "aHR0cHM6Ly9saW5rc3BhcmstbmVtdS5vcGVuY2xhd2lkNi5jaGF0Z3B0LnNpdGU=",
  "base64",
).toString("utf8");

const SKIPPED_REQUEST_HEADERS = new Set([
  "accept-encoding",
  "connection",
  "content-length",
  "host",
  "transfer-encoding",
]);

const SKIPPED_RESPONSE_HEADERS = new Set([
  "connection",
  "content-encoding",
  "content-length",
  "set-cookie",
  "transfer-encoding",
]);

function publicOrigin(request) {
  const forwardedHost = request.headers["x-forwarded-host"];
  const host = Array.isArray(forwardedHost)
    ? forwardedHost[0]
    : forwardedHost || request.headers.host;
  return `https://${host}`;
}

function rewriteUpstream(value, request) {
  if (!value) return value;
  const publicBase = publicOrigin(request);
  // Rewrite visible links, but keep percent-encoded OAuth callback URLs intact.
  // The dispatch-owned ChatGPT sign-in flow validates that callback origin.
  return String(value).replaceAll(UPSTREAM_ORIGIN, publicBase);
}

function requestHeaders(request) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(request.headers)) {
    if (SKIPPED_REQUEST_HEADERS.has(key.toLowerCase()) || value == null) continue;
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item);
    } else {
      headers.set(key, value);
    }
  }
  headers.set("x-forwarded-host", request.headers.host || "");
  headers.set("x-forwarded-proto", "https");
  return headers;
}

async function requestBody(request) {
  if (request.method === "GET" || request.method === "HEAD") return undefined;
  if (Buffer.isBuffer(request.body)) return request.body;
  if (typeof request.body === "string") return request.body;
  if (request.body != null) {
    const contentType = String(request.headers["content-type"] || "");
    if (contentType.includes("application/x-www-form-urlencoded")) {
      return new URLSearchParams(request.body).toString();
    }
    return JSON.stringify(request.body);
  }

  const chunks = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  return chunks.length ? Buffer.concat(chunks) : undefined;
}

function targetUrl(request) {
  const incoming = new URL(request.url, publicOrigin(request));
  const path = incoming.searchParams.get("__path") || "";
  incoming.searchParams.delete("__path");

  const target = new URL(`/${path.replace(/^\/+/, "")}`, UPSTREAM_ORIGIN);
  target.search = incoming.searchParams.toString();
  return target;
}

function forwardCookies(upstream, response, request) {
  const getSetCookie = upstream.headers.getSetCookie?.bind(upstream.headers);
  const cookies = getSetCookie
    ? getSetCookie()
    : [upstream.headers.get("set-cookie")].filter(Boolean);

  if (!cookies.length) return;
  response.setHeader(
    "set-cookie",
    cookies.map((cookie) =>
      rewriteUpstream(cookie, request).replace(/;\s*Domain=[^;]+/gi, ""),
    ),
  );
}

function isTextResponse(contentType) {
  return (
    contentType.startsWith("text/") ||
    contentType.includes("json") ||
    contentType.includes("javascript") ||
    contentType.includes("xml")
  );
}

export default async function handler(request, response) {
  try {
    const upstream = await fetch(targetUrl(request), {
      method: request.method,
      headers: requestHeaders(request),
      body: await requestBody(request),
      redirect: "manual",
    });

    response.statusCode = upstream.status;
    for (const [key, value] of upstream.headers.entries()) {
      if (SKIPPED_RESPONSE_HEADERS.has(key.toLowerCase())) continue;
      response.setHeader(key, rewriteUpstream(value, request));
    }
    forwardCookies(upstream, response, request);

    const contentType = upstream.headers.get("content-type") || "";
    const bytes = Buffer.from(await upstream.arrayBuffer());
    if (isTextResponse(contentType)) {
      response.end(rewriteUpstream(bytes.toString("utf8"), request));
    } else {
      response.end(bytes);
    }
  } catch {
    response.statusCode = 502;
    response.setHeader("content-type", "application/json; charset=utf-8");
    response.end(JSON.stringify({ error: "The NEMU service is temporarily unavailable." }));
  }
}
