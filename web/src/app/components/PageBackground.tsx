export default function PageBackground({ image, blur = 0 }: { image: string; blur?: number }) {
  const m = blur > 0 ? -blur * 3 : 0;
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: m,
        zIndex: -1,
        filter: blur > 0 ? `blur(${blur}px)` : undefined,
        background: `linear-gradient(rgba(5,10,25,0.3), rgba(5,10,25,0.55)), url(/backgrounds/${image}) center bottom / cover no-repeat`,
      }}
    />
  );
}