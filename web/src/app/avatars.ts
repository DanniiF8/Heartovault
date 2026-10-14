// Avatares do perfil. Os ficheiros ficam em /public/avatars/<id>.webp
export const AVATARS = [
  { id: "boy-base", label: "Boy · original" },
  { id: "boy-clothes-blue", label: "Boy · clothes blue" },
  { id: "boy-clothes-violet", label: "Boy · clothes violet" },
  { id: "boy-eyes-blue", label: "Boy · eyes blue" },
  { id: "boy-eyes-brown", label: "Boy · eyes brown" },
  { id: "boy-gems-blue", label: "Boy · gems blue" },
  { id: "boy-gems-green", label: "Boy · gems green" },
  { id: "boy-hair-black", label: "Boy · hair black" },
  { id: "boy-hair-blond", label: "Boy · hair blond" },
  { id: "boy-hair-red", label: "Boy · hair red" },
  { id: "girl-base", label: "Girl · original" },
  { id: "girl-clothes-blue", label: "Girl · clothes blue" },
  { id: "girl-clothes-violet", label: "Girl · clothes violet" },
  { id: "girl-eyes-blue", label: "Girl · eyes blue" },
  { id: "girl-eyes-brown", label: "Girl · eyes brown" },
  { id: "girl-gems-blue", label: "Girl · gems blue" },
  { id: "girl-gems-green", label: "Girl · gems green" },
  { id: "girl-hair-black", label: "Girl · hair black" },
  { id: "girl-hair-blond", label: "Girl · hair blond" },
  { id: "girl-hair-red", label: "Girl · hair red" },
];

export function avatarSrc(id: string | null | undefined) {
  const found = AVATARS.find((a) => a.id === id);
  return `/avatars/${(found ?? AVATARS[0]).id}.webp`;
}