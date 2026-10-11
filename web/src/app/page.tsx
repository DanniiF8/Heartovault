export default function HomePage() {
  return (
    <main style={{ margin: 0, padding: 0 }}>
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
      {/* secção de baixo — donações / extras — podes acrescentar depois */}
    </main>
  );
}