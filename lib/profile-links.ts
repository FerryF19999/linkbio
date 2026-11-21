export function destinationLabel(url: string): string {
  try {
    const destination = new URL(url);
    if (destination.protocol === "mailto:") return destination.pathname;
    if (["https:", "http:"].includes(destination.protocol)) return destination.hostname.replace(/^www\./, "");
  } catch {
    // Older profiles can contain relative or incomplete addresses.
  }
  return "";
}
