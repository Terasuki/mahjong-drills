export default function Tile({ id, size = '40px', isBack = false, tsumogiri = false}: { id: string; size?: string; isBack?: boolean; tsumogiri?: boolean; }) {
  const filter: React.CSSProperties = tsumogiri 
    ? { filter: 'brightness(0.6) grayscale(0.4)' } 
    : {};

  return (
    <div style={{ 
      display: 'inline-block', 
      position: 'relative', 
      width: size,
      ...filter
    }}>
      {!isBack ? (
        <>
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
        </>
      ) : (
        <img
          src="/assets/tiles/regular/back.svg"
          alt="hidden"
          style={{ width: size, height: 'auto', display: 'block' }}
        />
      )}
    </div>
  );
}