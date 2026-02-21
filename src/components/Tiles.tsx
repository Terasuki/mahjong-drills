export default function Tile({ id, size = '40px' }: { id: string; size: string }) {
  return (
    <div style={{ display: 'inline-block', position: 'relative', width: size }}>
      <img
        src="/assets/tiles/regular/front.svg"
        alt=""
        style={{ width: size, height: 'auto', display: 'block' }}
      />
      <img
        src={`/assets/tiles/regular/${id}.svg`}
        alt={id}
        style={{ width: size, height: 'auto', display: 'block', position: 'absolute', top: 0, left: 0 }}
      />
    </div>
  );
}