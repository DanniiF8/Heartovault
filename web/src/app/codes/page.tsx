import { supabase } from "../lib/supabase";
import CodesList, { CodeRow } from "./CodesList";

export const dynamic = "force-dynamic";

export default async function CodesPage() {
  const { data, error } = await supabase
    .from("codes")
    .select("id, code, reward, note, expires_on")
    .order("created_at", { ascending: false });

  const todayStr = new Date().toISOString().slice(0, 10);
  const today = Date.parse(todayStr);

  const codes: CodeRow[] = ((data ?? []) as Record<string, unknown>[]).map((r) => {
    const expires = r.expires_on ? String(r.expires_on).slice(0, 10) : null;
    const expired = expires !== null && expires < todayStr;
    return {
      id: Number(r.id),
      code: String(r.code ?? ""),
      reward: r.reward ? String(r.reward) : null,
      note: r.note ? String(r.note) : null,
      expires_on: expires,
      status: expired ? "expired" : "active",
      daysLeft: expires && !expired ? Math.round((Date.parse(expires) - today) / 86400000) : null,
    };
  });

  return (
    <main style={{ padding: "110px 24px 24px", maxWidth: 900 }}>
      <h1 style={{ fontSize: "1.75rem", margin: "0 0 6px", color: "#e7b457" }}>Redeem Codes</h1>
      <p style={{ color: "#94a3b8", margin: "0 0 24px" }}>
        Codes you can redeem in the game. Press Copy and paste it in the game.
      </p>
      {error ? (
        <p style={{ color: "#f87171" }}>Could not load the codes: {error.message}</p>
      ) : (
        <CodesList codes={codes} />
      )}
    </main>
  );
}
