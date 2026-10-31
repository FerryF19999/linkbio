export class AuthServiceUnavailableError extends Error {
  constructor() {
    super("Layanan login sedang tidak tersedia. Coba lagi sebentar; sesi kamu tidak dihapus.");
    this.name = "AuthServiceUnavailableError";
  }
}

export function isMissingAuthSession(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const { name, code, status } = error as {
    name?: string;
    code?: string;
    status?: number;
  };
  return (
    name === "AuthSessionMissingError" ||
    status === 401 ||
    status === 403 ||
    ["session_not_found", "session_expired", "refresh_token_not_found", "refresh_token_already_used", "bad_jwt"].includes(code ?? "")
  );
}

export function loginErrorMessage(error: unknown) {
  const { code, status } = (error ?? {}) as { code?: string; status?: number };
  if (code === "invalid_credentials") return "Email atau password tidak cocok. Periksa password lalu coba lagi.";
  if (status === 429 || code === "over_request_rate_limit") return "Terlalu banyak percobaan login. Tunggu sebentar sebelum mencoba lagi.";
  return "Login belum berhasil. Coba lagi sebentar atau reset sesi browser di bawah.";
}
