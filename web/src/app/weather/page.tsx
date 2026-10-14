import { supabase } from "../lib/supabase";
import WeatherCalendar from "./WeatherCalendar";

export const dynamic = "force-dynamic";

export default async function WeatherPage() {
  const { data, error } = await supabase
    .from("weather_days")
    .select("day, w1, w2, w3, w4")
    .order("day", { ascending: true })
    .limit(1000);

  const days: Record<string, (string | null)[]> = {};
  for (const row of (data ?? []) as Record<string, unknown>[]) {
    const day = String(row.day ?? "").slice(0, 10);
    if (!day) continue;
    days[day] = [row.w1, row.w2, row.w3, row.w4].map((v) => (v ? String(v) : null));
  }

  return (
    <main style={{ padding: "110px 24px 24px", maxWidth: 900 }}>
      <h1 style={{ fontSize: "1.75rem", margin: "0 0 6px", color: "#e7b457" }}>Weather Calendar</h1>
      <p style={{ color: "#94a3b8", margin: "0 0 24px" }}>Weather for each day of the month.</p>
      {error ? (
        <p style={{ color: "#f87171" }}>Could not load the weather data: {error.message}</p>
      ) : (
        <WeatherCalendar days={days} />
      )}
    </main>
  );
}
