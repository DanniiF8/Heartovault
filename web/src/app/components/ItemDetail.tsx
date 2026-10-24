import { Birthstone, EB_Garamond } from "next/font/google";
import BackButton from "./BackButton";
import ReportError from "./ReportError";

const titleFont = Birthstone({ weight: "400", subsets: ["latin"], display: "swap" });
const bodyFont = EB_Garamond({ subsets: ["latin"], display: "swap" });

type Props = {
  item: Record<string, unknown>;
  backLabel: string;
};

const PLACEHOLDERS = ["all", "-", "—", "none", "n/a", "null", "undefined"];

const BADGES = [
  { src: "/medals/blue.webp", glow: "rgba(90,170,255,0.95)", label: "Apprentice", key: "mastery_apprentice_req" },
  { src: "/medals/green.webp", glow: "rgba(110,225,120,0.95)", label: "Expert", key: "mastery_expert_req" },
  { src: "/medals/purple.webp", glow: "rgba(200,130,255,0.95)", label: "Master", key: "mastery_master_req" },
];

function isEmpty(v: unknown) {
  if (v === null || v === undefined) return true;
  const s = String(v).trim().toLowerCase();
  return s === "" || PLACEHOLDERS.includes(s);
}

function rowText(label: string, s: string, wide = false) {
  return (
    <div className={`id-box${wide ? " id-wide" : ""}`}>
      <div className="id-label">{label}</div>
      <div className="id-value">{s}</div>
    </div>
  );
}

function row(label: string, value: unknown, wide = false) {
  if (isEmpty(value)) return null;
  return rowText(label, String(value).trim(), wide);
}

function hasAny(item: Record<string, unknown>, keys: string[]) {
  return keys.some((k) => !isEmpty(item[k]));
}

function cell(item: Record<string, unknown>, key: string) {
  const v = item[key];
  return isEmpty(v) ? "—" : String(v).trim();
}

export default function ItemDetail({ item, backLabel }: Props) {
  const name = String(item.name ?? "");

  // weather/schedule: só mostra "All" quando o valor é mesmo "all"; vazio fica vazio
  const isAll = (v: unknown) => String(v ?? "").trim().toLowerCase() === "all";
  const weatherRow = isAll(item.weather) ? rowText("Weather", "All") : row("Weather", item.weather);
  const scheduleRow = isAll(item.schedule) ? rowText("Schedule", "All") : row("Schedule", item.schedule);

  const imageUrl = item.image_url ? String(item.image_url) : null;

  // se a zona for igual à location, mostra só a location
  const sameZone =
    !isEmpty(item.location) &&
    !isEmpty(item.location_zone) &&
    String(item.location).trim().toLowerCase() ===
      String(item.location_zone).trim().toLowerCase();

  const priceKeys = ["price_1", "price_2", "price_3", "price_4", "price_5"];
  const tokenKeys = [
    "price_sell_token_1",
    "price_sell_token_2",
    "price_sell_token_3",
    "price_sell_token_4",
    "price_sell_token_5",
  ];
  const energyKeys = ["energy_1", "energy_2", "energy_3", "energy_4", "energy_5"];
  const seedKeys = ["seed_sell_1", "seed_sell_2", "seed_sell_3", "seed_sell_4", "seed_sell_5"];

  const hasPrice = hasAny(item, priceKeys);
  const hasToken = hasAny(item, tokenKeys);
  const hasEnergy = hasAny(item, energyKeys);
  const hasSeedStar = hasAny(item, seedKeys);
  const hasMastery = hasAny(item, BADGES.map((b) => b.key));

  const starLevels = [1, 2, 3, 4, 5].filter((n) =>
    hasAny(item, [
      `price_${n}`,
      `price_sell_token_${n}`,
      `energy_${n}`,
      `seed_sell_${n}`,
    ])
  );

  const starCols = [
    { show: hasPrice, label: "Price", prefix: "price_" },
    { show: hasToken, label: "Token", prefix: "price_sell_token_" },
    { show: hasEnergy, label: "Energy", prefix: "energy_" },
    { show: hasSeedStar, label: "Seed sell", prefix: "seed_sell_" },
  ].filter((c) => c.show);
  const multiCols = starCols.length > 1;

  return (
    <main
      className={bodyFont.className}
      style={{ padding: "100px 24px 150px", textAlign: "center" }}
    >
      <style>{`
        .id-box {
          background:
            url(/ui/card_3.png) center / 100% 100% no-repeat,
            linear-gradient(160deg, rgba(13, 50, 112, 0.5), rgba(7, 26, 68, 0.5));
          border-radius: 14px;
          padding: 26px 32px;
          min-height: 96px;
          box-sizing: border-box;
          width: calc(50% - 5px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .id-wide { width: 100%; padding: 30px 60px; }
        .id-label { color: var(--hv-title); font-size: 1rem; margin-bottom: 2px; }
        .id-value { color: var(--hv-text); font-size: 1.2rem; overflow-wrap: anywhere; }
        .id-info { display: flex; flex-wrap: wrap; justify-content: center; align-items: flex-start; gap: 10px; }
        .id-h { width: 100%; color: var(--hv-title); font-size: 1.3rem; margin-top: 10px; }
        .id-cell { width: calc(33.333% - 7px); }
        .id-cell .id-box { width: 100%; min-height: 100px; padding: 24px 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; }
        .id-cell-name { color: var(--hv-title); font-size: 1rem; margin-top: 4px; }
        .id-star { width: 30px; height: 30px; object-fit: contain; filter: drop-shadow(0 0 4px rgba(255, 215, 110, 0.95)); }
        .id-badge { width: 46px; height: 46px; object-fit: contain; }
        .id-imgbox { width: 260px; height: 200px; margin: 16px auto 20px; display: flex; align-items: center; justify-content: center; padding: 40px; }
        .id-imgbox img { max-width: 100%; max-height: 100%; object-fit: contain; }
        @media (min-width: 561px) {
          .id-box { width: 180px; }
          .id-wide { width: 100%; max-width: 430px; }
          .id-cell { width: 130px; }
        }
      `}</style>

      <div style={{ textAlign: "left" }}>
        <BackButton label={backLabel} />
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <h1
          className={titleFont.className}
          style={{ fontSize: "3rem", fontWeight: 400, lineHeight: 1.1, margin: "12px 0 0", color: "var(--hv-title)" }}
        >
          {name}
        </h1>

        <div className="id-box id-imgbox">
          {imageUrl ? (
            <img src={imageUrl} alt={name} />
          ) : (
            <div style={{ opacity: 0.5, color: "var(--hv-text)" }}>No image</div>
          )}
        </div>

        <div className="id-info">
          {row("Unlock level", item.unlock_level)}
          {row("Location", item.location)}
          {!sameZone && row("Zone", item.location_zone)}
          {weatherRow}
          {scheduleRow}
          {row("Shadow", item.shadow)}
          {row("Event", item.event_tag)}
          {row("Growth time", item.growth_time)}
          {row("Seed cost", item.seed_cost)}
          {row("Seed sell", item.seed_sell)}
          {row("Ingredients", item.ingredients, true)}
          {row("Source", item.source, true)}
          {row("Notes", item.notes, true)}

          {!isEmpty(item.buy_price) &&
            rowText(
              "Price",
              `${String(item.buy_price).trim()}${
                !isEmpty(item.currency) ? ` ${String(item.currency).trim()}` : ""
              }`
            )}

          {row("Sell price", item.sell_price)}

          {starLevels.length > 0 && starCols.length > 0 && (
            <>
              <div className="id-h">By star</div>
              {starLevels.map((n) => (
                <div key={n} className="id-cell">
                  <div className="id-box">
                    <img className="id-star" src={`/stars/star_${n}.webp`} alt={`${n} star`} />
                    {starCols.map((c) => (
                      <div key={c.label}>
                        {multiCols && <div className="id-label">{c.label}</div>}
                        <div className="id-value">{cell(item, `${c.prefix}${n}`)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}

          {hasMastery && (
            <>
              <div className="id-h">Mastery</div>
              {BADGES.map((b) => (
                <div key={b.key} className="id-cell">
                  <div className="id-box">
                    <img
                      className="id-badge"
                      src={b.src}
                      alt={b.label}
                      style={{ filter: `drop-shadow(0 0 4px ${b.glow})` }}
                    />
                    <div className="id-value">{cell(item, b.key)}</div>
                  </div>
                  <div className="id-cell-name">{b.label}</div>
                </div>
              ))}
            </>
          )}
        </div>
        <ReportError item={item} />
      </div>
    </main>
  );
}