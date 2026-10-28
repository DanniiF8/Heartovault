import { Children, type ReactNode } from "react";
import { Birthstone, EB_Garamond } from "next/font/google";
import BackButton from "./BackButton";
import ReportError from "./ReportError";
import PageBackground from "./PageBackground";

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

const BG_BY_FILTER: Record<string, { image: string; blur?: number }> = {
  puzzles: { image: "puzzles.webp", blur: 6 },
  cds: { image: "cds.webp", blur: 6 },
  books: { image: "books.webp", blur: 6 },
};

const BG_BY_SUB: Record<string, { image: string; blur?: number }> = {
  crops: { image: "crops.webp", blur: 6 },
  flowers: { image: "flowers.webp", blur: 6 },
  ingredients: { image: "ingredients.webp", blur: 6 },
  instruments: { image: "instruments.webp", blur: 6 },
  items: { image: "items.webp", blur: 6 },
  tools: { image: "tools.webp", blur: 6 },
  toys: { image: "toys.webp", blur: 6 },
  vehicles: { image: "vehicles.webp", blur: 6 },
  world_resources: { image: "world_resources.webp", blur: 6 },
};

const BG_BY_CAT: Record<string, { image: string; blur?: number }> = {
  birds: { image: "birdwatching.webp", blur: 6 },
  fish: { image: "fishing.webp", blur: 6 },
  gardening: { image: "gardening.webp", blur: 6 },
  insects: { image: "insects.webp", blur: 6 },
  ka_ching_store: { image: "ka_ching_shop.webp", blur: 6 },
  ocean_cleanup: { image: "ocean_cleanup.webp", blur: 6 },
  other_collections: { image: "other_collections.webp", blur: 6 },
  pumpkin_carving: { image: "pumpkin_carving.webp", blur: 6 },
  recipes: { image: "cooking.webp" },
  sand_sculpture: { image: "sand_sculpting.webp", blur: 6 },
  snow_sculpture: { image: "snow_sculpting.webp", blur: 6 },
};

function DetailBackground({ item }: { item: Record<string, unknown> }) {
  const flt = String(item.filter ?? "").trim().toLowerCase();
  const sub = String(item.subcategory ?? "").trim().toLowerCase();
  const cat = String(item.category ?? "").trim().toLowerCase();
  const bg = BG_BY_FILTER[flt] ?? BG_BY_SUB[sub] ?? BG_BY_CAT[cat] ?? null;
  if (!bg) return null;
  return <PageBackground image={bg.image} blur={bg.blur} />;
}

function isEmpty(v: unknown) {
  if (v === null || v === undefined) return true;
  const s = String(v).trim().toLowerCase();
  return s === "" || PLACEHOLDERS.includes(s);
}

// fila centrada: se couber fica tudo numa linha; se não couber, reparte em filas equilibradas
function Row({ children, className = "" }: { children: ReactNode; className?: string }) {
  const items = Children.toArray(children);
  if (items.length === 0) return null;
  return (
    <div className={`id-row ${className}`} data-n={items.length}>
      {items}
    </div>
  );
}

// campo só em texto (sem caixa)
function plainText(label: string, s: string) {
  return (
    <div className="id-plain id-item">
      <div className="id-label">{label}</div>
      <div className="id-value">{s}</div>
    </div>
  );
}

// campo com caixa
function boxText(label: string, s: string, wide = false) {
  return (
    <div className={`id-box ${wide ? "id-wide" : "id-item"}`}>
      <div className="id-label">{label}</div>
      <div className="id-value">{s}</div>
    </div>
  );
}

function plain(label: string, value: unknown) {
  if (isEmpty(value)) return null;
  return plainText(label, String(value).trim());
}

function box(label: string, value: unknown, wide = false) {
  if (isEmpty(value)) return null;
  return boxText(label, String(value).trim(), wide);
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
  const weatherRow = isAll(item.weather) ? plainText("Weather", "All") : plain("Weather", item.weather);
  const scheduleRow = isAll(item.schedule) ? plainText("Schedule", "All") : plain("Schedule", item.schedule);

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
    <div style={{ position: "relative", isolation: "isolate" }}>
      <DetailBackground item={item} />
      <main
        className={bodyFont.className}
        style={{ padding: "100px 24px 150px", textAlign: "center" }}
      >
      <style>{`
        /* caixa: azul dos cartões + só uma linha dourada brilhante, cantos redondos */
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
        .id-wide { width: 100%; max-width: 430px; }
        .id-item { width: 140px; box-sizing: border-box; }
        .id-label { color: var(--hv-title); font-size: 1rem; margin-bottom: 2px; }
        .id-value { color: var(--hv-text); font-size: 1.2rem; overflow-wrap: anywhere; }
        .id-h { color: var(--hv-title); font-size: 1.3rem; margin-top: 10px; }

        /* tudo centrado, em colunas */
        .id-stack { display: flex; flex-direction: column; align-items: center; gap: 10px; }
        .id-row {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: stretch;
          gap: 10px;
          margin: 0 auto;
          max-width: 100%;
        }

        /* filas principais (itens de 140px): se não couber, reparte em filas equilibradas */
        @media (max-width: 637px) { .id-row:not(.id-sub-row)[data-n="4"] { max-width: 290px; } }
        @media (max-width: 787px) { .id-row:not(.id-sub-row)[data-n="5"] { max-width: 440px; } }
        .id-row:not(.id-sub-row)[data-n="6"] { max-width: 440px; }
        .id-row:not(.id-sub-row)[data-n="7"],
        .id-row:not(.id-sub-row)[data-n="8"] { max-width: 590px; }

        /* caixas grandes (estrelas e badges): uma caixa só */
        .id-bigbox { padding: 14px; max-width: 100%; gap: 0; }
        .id-sub {
          width: 100px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .id-cell-name { color: var(--hv-title); font-size: 1rem; }
        .id-star { width: 30px; height: 30px; object-fit: contain; filter: drop-shadow(0 0 4px rgba(255, 215, 110, 0.95)); }
        .id-badge { width: 46px; height: 46px; object-fit: contain; }

        /* telemóvel: estrelas e badges mais pequenos, tudo na mesma linha */
        @media (max-width: 617px) {
          .id-bigbox { padding: 10px 4px; width: 100%; }
          .id-sub-row { flex-wrap: nowrap; gap: 2px; width: 100%; }
          .id-sub { flex: 1 1 0; width: auto; min-width: 0; }
          .id-star { width: 24px; height: 24px; }
          .id-badge { width: 36px; height: 36px; }
          .id-sub .id-value { font-size: 1rem; }
          .id-sub .id-label { font-size: 0.7rem; }
          .id-cell-name { font-size: 0.8rem; }
        }

        /* caixa da imagem: moldura card_4 */
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
            linear-gradient(160deg, rgba(13, 50, 112, 0.5), rgba(7, 26, 68, 0.5));
        }
        .id-imgbox img { max-width: 100%; max-height: 100%; object-fit: contain; }
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

        <div className="id-imgbox">
          {imageUrl ? (
            <img src={imageUrl} alt={name} />
          ) : (
            <div style={{ opacity: 0.5, color: "var(--hv-text)" }}>No image</div>
          )}
        </div>

        <div className="id-stack">
          <Row>
            {plain("Unlock level", item.unlock_level)}
            {plain("Location", item.location)}
            {weatherRow}
            {scheduleRow}
          </Row>

          <Row>
            {!sameZone && box("Zone", item.location_zone)}
            {box("Shadow", item.shadow)}
            {box("Event", item.event_tag)}
            {box("Growth time", item.growth_time)}
            {box("Seed cost", item.seed_cost)}
            {box("Seed sell", item.seed_sell)}
          </Row>

          {box("Ingredients", item.ingredients, true)}
          {box("Source", item.source, true)}
          {box("Notes", item.notes, true)}

          <Row>
            {!isEmpty(item.buy_price) &&
              boxText(
                "Price",
                `${String(item.buy_price).trim()}${
                  !isEmpty(item.currency) ? ` ${String(item.currency).trim()}` : ""
                }`
              )}
            {box("Sell price", item.sell_price)}
          </Row>

          {starLevels.length > 0 && starCols.length > 0 && (
            <>
              <div className="id-h">Price by star</div>
              <div className="id-box id-bigbox">
                <Row className="id-sub-row">
                  {starLevels.map((n) => (
                    <div key={n} className="id-sub">
                      <img className="id-star" src={`/stars/star_${n}.webp`} alt={`${n} star`} />
                      {starCols.map((c) => (
                        <div key={c.label}>
                          {multiCols && <div className="id-label">{c.label}</div>}
                          <div className="id-value">{cell(item, `${c.prefix}${n}`)}</div>
                        </div>
                      ))}
                    </div>
                  ))}
                </Row>
              </div>
            </>
          )}

          {hasMastery && (
            <>
              <div className="id-h">Mastery</div>
              <div className="id-box id-bigbox">
                <Row className="id-sub-row">
                  {BADGES.map((b) => (
                    <div key={b.key} className="id-sub">
                      <div className="id-cell-name">{b.label}</div>
                      <img
                        className="id-badge"
                        src={b.src}
                        alt={b.label}
                        style={{ filter: `drop-shadow(0 0 4px ${b.glow})` }}
                      />
                      <div className="id-value">{cell(item, b.key)}</div>
                    </div>
                  ))}
                </Row>
              </div>
            </>
          )}
        </div>
        <ReportError item={item} />
      </div>
      </main>
    </div>
  );
}