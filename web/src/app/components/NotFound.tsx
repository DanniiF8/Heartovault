import BackButton from "./BackButton";

export default function NotFound({ backLabel }: { backLabel: string }) {
  return (
    <main style={{ paddingTop: 110, minHeight: "100vh", color: "#e7b457" }}>
      <BackButton label={backLabel} />
      <div style={{ maxWidth: 1200, margin: "0 auto", paddingLeft: 16 }}>
        <p
          style={{
            fontSize: "1.3rem",
            margin: 0,
            textShadow: "0 1px 4px rgba(0,0,0,1), 0 0 12px rgba(0,0,0,0.9)",
          }}
        >
          Not found
        </p>
      </div>
    </main>
  );
}