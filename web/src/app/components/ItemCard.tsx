import type { ListItem } from "./ItemListWithFilters";

// "Starspell Voyager ( Platform) Lost City" -> 3 linhas
function nameLines(name: string): string[] {
  const m = name.match(/^(.*?)\s*\(\s*(.*?)\s*\)\s*(.*)$/);
  if (!m) return [name];
  return [m[1].trim(), `(${m[2].trim()})`, m[3].trim()].filter(Boolean);
}

// os 3 badges de mastery (a ordem é a das colunas apprentice, expert, master)
const BADGES = [
  { n: 1, src: "/medals/blue.webp", glow: "rgba(90,170,255,0.95)", label: "Apprentice" },
  { n: 2, src: "/medals/green.webp", glow: "rgba(110,225,120,0.95)", label: "Expert" },
  { n: 3, src: "/medals/purple.webp", glow: "rgba(200,130,255,0.95)", label: "Master" },
];

// estilos dos cartões (mete-se uma vez só, antes da lista)
// Altura do cartão = 150cqw. Zonas: topo 12 | imagem 66 | nome 24 | estrelas+badges (resto)
export function ItemCardStyles() {
  return (
    <style>{`
      .it-wrap {
        --aura: transparent;
        position: relative;
        isolation: isolate;
        container-type: inline-size;
        aspect-ratio: 2 / 3;
        display: flex;
        flex-direction: column;
        padding: 12% 10% 12%;
        box-sizing: border-box;
        color: #e7b457;
        transition: transform 0.25s ease;
      }
      .it-wrap:hover { transform: translateY(-3px); }

      /* camadas: fundo azul, moldura, brilho que passa */
      .it-fill, .it-frame, .it-shine {
        position: absolute;
        inset: 0;
        pointer-events: none;
        border-radius: 9% / 6%;
      }
      .it-fill { z-index: 0; background: linear-gradient(160deg, rgba(13, 50, 112, 0.5), rgba(7, 26, 68, 0.5)); transition: background 0.6s ease; }
      .it-frame { z-index: 0; background: url(/ui/card_objeto.webp) center / 100% 100% no-repeat; transition: filter 0.6s ease; }
      .it-shine { z-index: 2; overflow: hidden; display: none; }
      .it-art, .it-name, .it-info { position: relative; z-index: 1; }

      /* luz por trás do cartão */
      .it-wrap::before {
        content: "";
        position: absolute;
        inset: -10%;
        z-index: -1;
        background: radial-gradient(closest-side, var(--aura), transparent);
        opacity: 0;
        transition: opacity 0.8s ease;
        pointer-events: none;
      }

      /* 1) por obter: tudo a preto e branco */
      .is-off .it-frame, .is-off .it-img { filter: grayscale(1) brightness(0.85); }
      .is-off .it-name { color: #b3ad9d; }

      /* 2) obtido: acende com cor e uma luz azul por trás */
      .is-on { --aura: rgba(90, 170, 255, 0.5); }
      .is-on::before { opacity: 1; }
      .is-on .it-frame { filter: drop-shadow(0 0 6px rgba(120, 190, 255, 0.7)); }
      .is-on .it-fill { background: linear-gradient(160deg, rgba(18, 64, 138, 0.5), rgba(8, 35, 90, 0.5)); }

      /* 3) completo: dourado, luz quente que respira e um brilho que passa devagar */
      .is-full { --aura: rgba(255, 196, 80, 0.6); }
      .is-full::before { opacity: 1; animation: itPulse 3.5s ease-in-out infinite; }
      .is-full .it-frame { filter: sepia(0.9) saturate(2.4) hue-rotate(-10deg) brightness(1.12) drop-shadow(0 0 8px rgba(255, 205, 90, 0.8)); }
      .is-full .it-fill { background: linear-gradient(160deg, rgba(26, 63, 122, 0.5), rgba(10, 34, 82, 0.5)); }
      .is-full .it-shine { display: block; }
      .it-shine::after {
        content: "";
        position: absolute;
        top: -20%;
        bottom: -20%;
        left: -40%;
        width: 30%;
        background: linear-gradient(100deg, transparent, rgba(255, 236, 170, 0.35), transparent);
        transform: skewX(-12deg);
        animation: itSweep 5s ease-in-out infinite;
      }
      @keyframes itSweep { 0%, 55% { left: -40%; } 100% { left: 125%; } }
      @keyframes itPulse { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; } }
      @keyframes itPop { 0% { transform: scale(0.6); } 60% { transform: scale(1.25); } 100% { transform: scale(1); } }

      /* imagem */
      .it-art { flex: 0 0 66cqw; display: flex; align-items: center; justify-content: center; min-height: 0; }
      .it-img { display: block; max-width: 88%; max-height: 92%; object-fit: contain; transition: filter 0.6s ease; }
      .it-none { opacity: 0.35; font-size: 5cqw; }

      /* nome: centrado, até 2 linhas, por cima da linha dourada */
      .it-name {
        flex: 0 0 24cqw;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 0 2cqw;
        color: #e7b457;
        text-decoration: none;
        min-width: 0;
      }
      .it-name-t {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        font-weight: 700;
        font-size: 8cqw;
        line-height: 1.1;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.95), 0 0 8px rgba(0, 0, 0, 0.7);
      }
      .it-name-t.wide { display: block; -webkit-line-clamp: unset; font-size: 6.5cqw; }

      /* estrelas e badges: por baixo da linha, centrados (estrelas primeiro) */
      .it-info { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.5cqw; min-width: 0; }
      .it-badges, .it-stars { display: flex; gap: 2cqw; justify-content: center; }
      .it-badge, .it-star { padding: 0; border: none; background: transparent; cursor: pointer; line-height: 0; }
      .it-badge { width: 16cqw; height: 16cqw; }
      .it-star { width: 15cqw; height: 15cqw; }
      .it-badge img, .it-star img { width: 100%; height: 100%; object-fit: contain; filter: grayscale(1) brightness(0.7) opacity(0.55); transition: filter 0.3s ease, transform 0.2s ease; }
      .it-badge:hover img, .it-star:hover img { filter: grayscale(0.3) brightness(0.95) opacity(0.85); transform: scale(1.12); }
      .it-badge.lit img { filter: drop-shadow(0 0 4px var(--glow)); animation: itPop 0.4s ease; }
      .it-star.lit img { filter: drop-shadow(0 0 4px rgba(255, 215, 110, 0.95)); animation: itPop 0.4s ease; }

      /* itens sem estrelas: só o visto de obtido */
      .it-check {
        width: 14cqw; height: 14cqw; border-radius: 50%; cursor: pointer;
        font-size: 8cqw; line-height: 1;
        border: 1px solid rgba(231, 180, 87, 0.7);
        background: rgba(2, 20, 50, 0.75); color: transparent;
      }