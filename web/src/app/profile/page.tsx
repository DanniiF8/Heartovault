import ProfileClient from "./ProfileClient";

export default function ProfilePage() {
  return (
    <main style={{ padding: "110px 24px 24px" }}>
      <h1 style={{ fontSize: "1.75rem", margin: "0 0 20px", color: "#e7b457" }}>Profile</h1>
      <ProfileClient />
    </main>
  );
}
