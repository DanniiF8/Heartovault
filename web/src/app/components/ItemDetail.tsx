import { Birthstone, EB_Garamond } from "next/font/google";
import BackButton from "./BackButton";
import ObtainedButton from "./ObtainedButton";
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

  const cols = [
    "44px",
    hasPrice ? "1fr" : null,
    hasToken ? "1fr" : null,
    hasEnergy ? "1fr" : null,
    hasSeedStar ? "1fr" : null,
  ].filter(Boolean);

  return (
    <main
      className={bodyFont.className}
      style={{ padding: "100px 24px 150px", maxWidth: 760, margin: "0 auto", textAlign: "center" }}
    >
      <style>{`
        .id-box {
          background:
            url(/ui/card_menu.webp) center / 100% 100% no-repeat,
            linear-gradient(160deg, rgba(13, 50, 112, 0.5), rgba(7, 26, 68, 0.5));
          border-radius: 14px;
          padding: 16px 20px;
          box-sizing: border-box;
          width: calc(50% - 5px);
        }
        .id-wide { width: 100%; }
        .id-label { color: var(--hv-title); font-size: 1rem; margin-bottom: 2px; }
        .id-value { color: var(--hv-text); font-size: 1.2rem; overflow-wrap: anywhere; }
        .id-info { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
        .id-table { display: grid; gap: 8px 6px; align-items: center; justify-items: center; color: var(--hv-text); font-size: 1.15rem; }
        .id-th { color: var(--hv-title); font-size: 1rem; }
        .id-star { width: 30px; height: 30px; object-fit: contain; filter: drop-shadow(0 0 4px rgba(255, 215, 110, 0.95)); }
        .id-badge { width: 46px; height: 46px; object-fit: contain; }
        @media (min-width: 561px) {
          .id-box { width: 210px; }
          .id-wide { width: 100%; max-width: 430px; }
        }
      `}</style>

      <div style={{ textAlign: "left" }}>
        <BackButton label={backLabel} />
      </div>
      <h1
        className={titleFont.className}
        style={{ fontSize: "3rem", fontWeight: 400, lineHeight: 1.1, margin: "12px 0 16px", color: "var(--hv-title)" }}
      >
        {name}
      </h1>
      <ObtainedButton
        item={{
          name,
          set: item.set ? String(item.set) : null,
          item_key: item.item_key ? String(item.item_key) : null,
        }}
      />

      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          width={160}
          height={160}
          style={{ objectFit: "contain", margin: "16px 0 24px" }}
        />
      ) : (
        <div style={{ opacity: 0.4, margin: "16px 0 24px", color: "var(--hv-text)" }}>No image</div>
      )}

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

        {starLevels.length > 0 && cols.length > 1 && (
          <div className="id-box id-wide">
            <div className="id-label" style={{ marginBottom: 10 }}>By star</div>
            <div className="id-table" style={{ gridTemplateColumns: cols.join(" ") }}>
              <div />
              {hasPrice && <div className="id-th">Price</div>}
              {hasToken && <div className="id-th">Token</div>}
              {hasEnergy && <div className="id-th">Energy</div>}
              {hasSeedStar && <div className="id-th">Seed sell</div>}

              {starLevels.map((n) => (
                <div key={n} style={{ display: "contents" }}>
                  <img className="id-star" src={`/stars/star_${n}.webp`} alt={`${n} star`} />
                  {hasPrice && <div>{cell(item, `price_${n}`)}</div>}
                  {hasToken && <div>{cell(item, `price_sell_token_${n}`)}</div>}
                  {hasEnergy && <div>{cell(item, `energy_${n}`)}</div>}
                  {hasSeedStar && <div>{cell(item, `seed_sell_${n}`)}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {hasMastery && (
          <div className="id-box id-wide">
            <div className="id-label" style={{ marginBottom: 10 }}>Mastery</div>
            <div className="id-table" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
              {BADGES.map((b) => (
                <img
                  key={b.key}
                  className="id-badge"
                  src={b.src}
                  alt={b.label}
                  style={{ filter: `drop-shadow(0 0 4px ${b.glow})` }}
                />
              ))}
              {BADGES.map((b) => (
                <div key={b.key} className="id-th">{b.label}</div>
              ))}
              {BADGES.map((b) => (
                <div key={b.key}>{cell(item, b.key)}</div>
              ))}
            </div>
          </div>
        )}
      </div>
      <ReportError item={item} />
    </main>
  );
}