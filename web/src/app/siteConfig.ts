// Dados do site num só sítio.
// contactEmail: o teu email público de contacto (por exemplo "hello@o-teu-dominio.com").
//   Enquanto estiver vazio, o link de contacto e o "reportar erro" não aparecem.
// siteUrl: o endereço do site, sem barra no fim (por exemplo "https://heartovault.vercel.app").
//   Enquanto estiver vazio, não se cria o mapa do site (sitemap).
export const siteConfig = {
  name: "Heartovault",
  contactEmail: "",
  siteUrl: "",
  lastUpdated: "October 2026",
};

export const siteUrl = siteConfig.siteUrl.replace(/\/+$/, "");
