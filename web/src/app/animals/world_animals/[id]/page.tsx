import { Birthstone, EB_Garamond } from "next/font/google";
import { supabase } from "../../../lib/supabase";
import BackButton from "../../../components/BackButton";
import PageBackground from "../../../components/PageBackground";
import NotFound from "../../../components/NotFound";

export const dynamic = "force-dynamic";

const titleFont = Birthstone({ weight: "400", subsets: ["latin"], display: "swap" });
const bodyFont = EB_Garamond({ subsets: ["latin"], display: "swap" });

const PLACEHOLDERS = ["-", "—", "none", "n/a", "null", "undefined"];

function isEmpty(v: unknown) {
  if (v === null || v === undefined) return true;
  const s = String(v).trim().toLowerCase();
  return s === "" || PLACEHOLDERS.includes(s);
}

export default async function WorldAnimalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: item, error } = await supabase
    .from("world_animals")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !item) {
    return <NotFound backLabel="World Animals" />;
  }

  const foods: string[] = isEmpty(item.food)
    ? []
    : String(item.food)
        .split(/[\/|]/)
        .map((s: string) => s.trim())
        .filter(Boolean);
          const weathers: string[] = isEmpty(item.weather)
    ? []
    : String(item.weather)
        .split(/[\/|,]/)
        .map((s: string) => s.trim())
        .filter(Boolean);

  const plain = (label: string, value: unknown) =>
    isEmpty(value) ? null : (
      <div className="id-plain id-item">
        <div className="id-label">{label}</div>
        <div className="id-value">{String(value).trim()}</div>
      </div>
    );

  const box = (label: string, value: unknown) =>
    isEmpty(value) ? null : (
      <div className="id-box id-item">
        <div className="id-label">{label}</div>
        <div className="id-value">{String(value).trim()}</div>
      </div>
    );

  return (
    <div style={{ position: "relative", isolation: "isolate", color: "var(--hv-text)" }}>
      <PageBackground image="world_animals.webp" blur={4} />
      <main
        className={bodyFont.className}
        style={{ padding: "110px 24px 150px", textAlign: "center" }}
      >
        <style>{`
          .id-box {
            background: linear-gradient(160deg, rgba(13, 50, 112, 0.5), rgba(7, 26, 68, 0.5));
            border: 1px solid #f0c46a;
            border-radius: 14px;
            box-shadow: 0 0 6px rgba(240, 196, 106, 0.7), inset 0 0 5px rgba(240, 196, 106, 0.35);
            padding: 12px 18px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 4px;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }
          @media (hover: hover) {
            .id-box:hover {
              transform: translateY(-4px);
              box-shadow: 0 0 14px rgba(240, 196, 106, 0.95), inset 0 0 8px rgba(240, 196, 106, 0.5);
            }
          }
          .id-item { width: 140px; box-sizing: border-box; }
          .id-food { min-width: 140px; }
                    .id-foodicon { width: 32px; height: 32px; }
          .id-label { color: var(--hv-title); font-size: 1rem; margin-bottom: 2px; }
          .id-value { color: var(--hv-text); font-size: 1.2rem; overflow-wrap: anywhere; }
          .id-h { color: var(--hv-title); font-size: 1.3rem; margin-top: 10px; }
          .id-stack { display: flex; flex-direction: column; align-items: center; gap: 10px; }
          .id-row {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            align-items: stretch;
            gap: 10px;
            margin: 0 auto;
            max-width: 590px;
          }
          .id-imgbox {
            width: 260px;
            height: 200px;
            margin: 16px auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px;
            box-sizing: border-box;
            background:
             url(/ui/card_4.png) center / 100% 100% no-repeat,
linear-gradient(160deg, rgba(13, 50, 112, 0.5), rgba(7, 26, 68, 0.5)) center / calc(100% - 20px) calc(100% - 20px) no-repeat;
          }
        `}</style>

        <div style={{ textAlign: "left" }}>
          <BackButton label="World Animals" />
        </div>

        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <h1
            className={titleFont.className}
            style={{
              fontSize: "2.7rem",
              fontWeight: 400,
              lineHeight: 1.1,
              margin: "12px 0 0",
              color: "var(--hv-title)",
            }}
          >
            {String(item.name ?? "")}
          </h1>

          <div className="id-imgbox">
            <div style={{ opacity: 0.5, color: "var(--hv-text)" }}>No image</div>
          </div>

          <div className="id-stack">
            <div className="id-row">
              {plain("Location", item.location)}
              {weathers.length > 0 && (
                <div className="id-plain id-item">
                  <div className="id-label">Weather</div>
                  {weathers.map((w, i) => (
                    <div key={i} className="id-value">{w}</div>
                  ))}
                </div>
              )}
            </div>

            <div className="id-row">
              {box("Event", item.event_tag)}
            </div>

            {foods.length > 0 && (
              <>
                <div className="id-h">Food</div>
                <div className="id-row">
                  {foods.map((f, i) => (
                    <div key={i} className="id-box id-food">
                      <div className="id-foodicon" />
                      <div className="id-value">{f}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}