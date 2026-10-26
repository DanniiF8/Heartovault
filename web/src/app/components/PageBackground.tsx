export default function PageBackground({ image }: { image: string }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        background: `linear-gradient(rgba(5,10,25,0.3), rgba(5,10,25,0.55)), url(/backgrounds/${image}) center bottom / cover no-repeat`,
      }}
    />
  );
}