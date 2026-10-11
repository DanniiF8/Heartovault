export default function HomePage() {
  return (
    <>
      <style>{`
        .hero-bg, .hero-fg {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
          margin: 0;
          padding: 0;
          border: none;
          z-index: 0;
        }
        /* fundo desfocado: preenche o espaço vazio quando a janela é estreita */
        .hero-bg {
          object-fit: cover;
          filter: blur(28px) brightness(0.55);
          transform: scale(1.1);
        }
        /* imagem principal: em janelas largas preenche tudo */
        .hero-fg {
          object-fit: cover;
          object-position: center top;
        }
        /* em janelas mais estreitas (mais altas que a imagem) mostra a imagem inteira */
        @media (max-aspect-ratio: 3/2) {
          .hero-fg {
            object-fit: contain;
          }
        }
      `}</style>
      <img className="hero-bg" src="/hero.png" alt="" aria-hidden="true" />
      <img className="hero-fg" src="/hero.png" alt="Heartovault" />
    </>
  );
}
