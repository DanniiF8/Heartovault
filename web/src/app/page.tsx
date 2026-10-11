export default function HomePage() {
  return (
    <main style={{ margin: 0, padding: 0, minHeight: "100vh" }}>
      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          backgroundImage: "url('/hero.png')",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
        }}
      />
    </main>
  );
}