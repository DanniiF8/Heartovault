import BackButton from "./BackButton";

type Props = {
  item: Record<string, unknown>;
  backLabel: string;
};

function row(label: string, value: unknown) {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  if (!s) return null;
  const lower = s.toLowerCase();
  if (["all", "-", "—", "none", "n/a", "null", "undefined"].includes(lower)) {
    return null;
  }
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ color: "#94a3b8", fontSize: "0.8rem", marginBottom: 2 }}>{label}</div>
      <div style={{ color: "#e8f4ff" }}>{s}</div>
    </div>
  );
}

function val(item: Record<string, unknown>, key: string) {
  return item[key];
}

function hasAny(item: Record<string, unknown>, keys: string[]) {
  return keys.some((k) => {
    const v = item[k];
    return v != null && v !== "";
  });
}

export default function ItemDetail({ item, backLabel }: Props) {
  const name = String(item.name ?? "");
  const imageUrl = item.image_url ? String(item.image_url) : null;

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

  const starLevels = [1, 2, 3, 4, 5].filter((n) => {
    const p = val(item, `price_${n}`);
    const t = val(item, `price_sell_token_${n}`);
    const e = val(item, `energy_${n}`);
    const s = val(item, `seed_sell_${n}`);
    return (
      (p != null && p !== "") ||
      (t != null && t !== "") ||
      (e != null && e !== "") ||
      (s != null && s !== "")
    );
  });

  const cols = [
    "40px",
    hasPrice ? "1fr" : null,
    hasToken ? "1fr" : null,
    hasEnergy ? "1fr" : null,
    hasSeedStar ? "1fr" : null,
  ].filter(Boolean);

  return (
    <main style={{ padding: "100px 24px 24px", maxWidth: 560 }}>
      <BackButton label={backLabel} />
      <h1 style={{ fontSize: "1.75rem", margin: "16px 0", color: "#e7b457" }}>{name}</h1>

      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          width={160}
          height={160}
          style={{ objectFit: "contain", marginBottom: 24 }}
        />
      ) : (
        <div style={{ opacity: 0.4, marginBottom: 24 }}>No image</div>
      )}

      <div>
        {row("Unlock level", item.unlock_level)}
        {row("Max stars", item.max_stars)}
        {row("Location", item.location)}
        {row("Zone", item.location_zone)}
        {row("Weather", item.weather)}
        {row("Schedule", item.schedule)}
        {row("Shadow", item.shadow)}
        {row("Event", item.event_tag)}
        {row("Growth time", item.growth_time)}
        {row("Seed cost", item.seed_cost)}
        {row("Seed sell", item.seed_sell)}
        {row("Ingredients", item.ingredients)}
        {row("Source", item.source)}

        {(item.buy_price != null && item.buy_price !== "") || item.currency ? (
          <div style={{ marginBottom: 10 }}>
            <div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>Price</div>
            <div style={{ color: "#e8f4ff" }}>
              {item.buy_price != null && item.buy_price !== "" ? String(item.buy_price) : ""}
              {item.currency ? ` ${item.currency}` : ""}
            </div>
          </div>
        ) : null}

        {row("Sell price", item.sell_price)}

        {starLevels.length > 0 && cols.length > 1 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ color: "#94a3b8", fontSize: "0.8rem", marginBottom: 8 }}>By star</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: cols.join(" "),
                gap: 8,
                fontSize: "0.9rem",
                color: "#e8f4ff",
              }}
            >
              <div style={{ color: "#94a3b8" }}>★</div>
              {hasPrice && <div style={{ color: "#94a3b8" }}>Price</div>}
              {hasToken && <div style={{ color: "#94a3b8" }}>Token</div>}
              {hasEnergy && <div style={{ color: "#94a3b8" }}>Energy</div>}
              {hasSeedStar && <div style={{ color: "#94a3b8" }}>Seed sell</div>}

              {starLevels.map((n) => (
                <div key={n} style={{ display: "contents" }}>
                  <div>{n}</div>
                  {hasPrice && (
                    <div>
                      {val(item, `price_${n}`) != null && val(item, `price_${n}`) !== ""
                        ? String(val(item, `price_${n}`))
                        : "—"}
                    </div>
                  )}
                  {hasToken && (
                    <div>
                      {val(item, `price_sell_token_${n}`) != null &&
                      val(item, `price_sell_token_${n}`) !== ""
                        ? String(val(item, `price_sell_token_${n}`))
                        : "—"}
                    </div>
                  )}
                  {hasEnergy && (
                    <div>
                      {val(item, `energy_${n}`) != null && val(item, `energy_${n}`) !== ""
                        ? String(val(item, `energy_${n}`))
                        : "—"}
                    </div>
                  )}
                  {hasSeedStar && (
                    <div>
                      {val(item, `seed_sell_${n}`) != null && val(item, `seed_sell_${n}`) !== ""
                        ? String(val(item, `seed_sell_${n}`))
                        : "—"}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}