"use client";

// Last-resort boundary. It replaces the root layout, so no stylesheet is
// loaded here: everything is inline. Town pages normally stop at
// (town)/error.tsx and never reach this.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F9F6F0",
          color: "#3D5038",
          fontFamily: "Georgia, 'Times New Roman', serif",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: "28rem" }}>
          <h1 style={{ fontSize: "1.75rem", margin: "0 0 0.75rem" }}>Something went wrong</h1>
          <p style={{ color: "#635E56", margin: "0 0 1.5rem", lineHeight: 1.5 }}>
            The rest of townofharmony.org is working. Try again, or go back to the homepage.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              background: "#2C3B26",
              color: "#F9F6F0",
              border: 0,
              borderRadius: "9999px",
              padding: "0.65rem 1.25rem",
              fontSize: "0.9rem",
              cursor: "pointer",
              marginRight: "0.75rem",
            }}
          >
            Try again
          </button>
          <a
            href="/"
            style={{
              display: "inline-block",
              border: "1px solid #E8E2D6",
              background: "#fff",
              color: "#3D5038",
              borderRadius: "9999px",
              padding: "0.6rem 1.25rem",
              fontSize: "0.9rem",
              textDecoration: "none",
            }}
          >
            Go to homepage
          </a>
          {error.digest ? (
            <p style={{ fontSize: "0.75rem", color: "#635E56", marginTop: "1.5rem" }}>
              Reference {error.digest}
            </p>
          ) : null}
        </div>
      </body>
    </html>
  );
}
