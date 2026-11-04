// Dados do site num só sítio.
// contactEmail: já não é preciso para o formulário (o email fica no painel do Web3Forms).
//   Deixa vazio.
// web3formsKey: chave pública do Web3Forms. Pode estar no código, não revela o email.
// siteUrl: o endereço do site, sem barra no fim (por exemplo "https://heartovault.vercel.app").
//   Enquanto estiver vazio, não se cria o mapa do site (sitemap).
export const siteConfig = {
  name: "Heartovault",
  contactEmail: "",
  web3formsKey: "de91f18b-3cc1-4eae-8f82-c2b95500f7d0",
  siteUrl: "https://web-heartovault.vercel.app",
  lastUpdated: "October 2026",
};

export const siteUrl = siteConfig.siteUrl.replace(/\/+$/, "");