// Tipos de tempo. A "key" é o que escreves na tabela weather_days (colunas w1 a w4).
// Se existir o ícone /public/weather-icons/<key>.png, é usado; senão aparece o emoji.
export const WEATHER_TYPES = [
  { key: "sunny", label: "Sunny", emoji: "☀️" },
  { key: "cloudy", label: "Cloudy", emoji: "☁️" },
  { key: "rain", label: "Rain", emoji: "🌧️" },
  { key: "rainbow", label: "Rainbow", emoji: "🌈" },
  { key: "aurora", label: "Aurora", emoji: "🌌" },
  { key: "meteor_shower", label: "Meteor Shower", emoji: "☄️" },
  { key: "snow", label: "Snow", emoji: "❄️" },
  { key: "scorching_heat", label: "Scorching Heat", emoji: "🔥" },
  { key: "petal_rain", label: "Petal Rain", emoji: "🌸" },
];

// As quatro janelas do dia (colunas w1, w2, w3, w4)
export const WINDOWS = ["00–06", "06–12", "12–18", "18–24"];
