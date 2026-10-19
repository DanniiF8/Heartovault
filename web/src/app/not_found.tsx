export default function NotFound() {
  return (
    <main
      style={{
        padding: "140px 24px 60px",
        textAlign: "center",
        maxWidth: 560,
        margin: "0 auto",
      }}
    >
      <h1 style={{ fontSize: "2rem", color: "#e7b457", margin: "0 0 12px" }}>Nothing here yet</h1>
      <p style={{ color: "#dbe7f7", lineHeight: 1.6, margin: "0 0 24px" }}>
        We could not find this page. It may have moved, or the link may be wrong.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <a
          href="/"
          style={{
            padding: "10px 22px",
            borderRadius: 999,
            background: "#e7b457",
            color: "#021432",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Go home
        </a>
        <a
          href="/collections"
          style={{
            padding: "10px 22px",
            borderRadius: 999,
            border: "1px solid rgba(231,180,87,0.6)",
            color: "#e7b457",
            textDecoration: "none",
          }}
        >
          Browse collections
        </a>
      </div>
    </main>
  );
}
