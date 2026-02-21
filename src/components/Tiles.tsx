export default function Tile({ id, size = '40px', isBack = false}: { id: string; size?: string; isBack?: boolean }) {
  return (
    <div style={{ display: 'inline-block', position: 'relative', width: size }}>
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
            style={{ 
              width: size, 
              height: 'auto', 
              display: 'block', 
              position: 'absolute', 
              top: 0, 
              left: 0 
            }}
          />
        </>
      ) : (
        <img
          src="/assets/tiles/regular/back.svg"
          alt="hidden tile"
          style={{ width: size, height: 'auto', display: 'block' }}
        />
      )}
    </div>
  );
}