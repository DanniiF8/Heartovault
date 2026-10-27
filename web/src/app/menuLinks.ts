// Menus "More" e "Shops": muda aqui as ligações e aparecem no menu e nas páginas
import type { MenuLink } from "./collectionsLinks";

export const moreLinks: MenuLink[] = [
  { href: "/timers", label: "Timers", icon: "/icons/menu/timers.webp" },
  { href: "/animals/world_animals", label: "Animals", icon: "/icons/menu/animals.webp" },
  { href: "/map", label: "Map", icon: "/icons/menu/map.webp" },
  { href: "/weather", label: "Weather Calendar", icon: "/icons/menu/weather.webp" },
];

export const shopsLinks: MenuLink[] = [{ href: "/shop", label: "Ka Ching Store" }];