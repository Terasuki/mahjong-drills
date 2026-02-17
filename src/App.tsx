import Tile from './components/Tiles';
import './App.css'
import { useState, useEffect } from 'react';
import type { GameState, Event } from './types';
import { sortTiles } from './utilities/mahjong';

function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [cursor, setCursor] = useState(0);
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    fetch('/test.json')
      .then((res) => res.text())
      .then((data) => {
        const lines: Event[] = data.trim().split('\n').map(line => JSON.parse(line));
        setEvents(lines);

        const startIndex = lines.findIndex(line => line.type === 'start_kyoku');
        if (startIndex !== -1) {
          const setup = lines[startIndex] as Extract<Event, { type: 'start_kyoku' }>;
          setGameState({
            bakaze: setup.bakaze,
            kyoku: setup.kyoku,
            honba: setup.honba,
            dora_marker: setup.dora_marker,
            oya: setup.oya,
            tehais: setup.tehais.map(hand => sortTiles(hand)),
            discards: [[], [], [], []],
            scores: setup.scores,
            type: 'start_kyoku',
          });
          setCursor(startIndex + 1);
        }
      })
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  const handleNext = () => {
    if (cursor >= events.length || !gameState) return;

    const event = events[cursor];
    const newState = { ...gameState };

    switch (event.type) {
      case "tsumo": {
        const actorHand = [...newState.tehais[event.actor], event.pai];
        newState.tehais[event.actor] = actorHand;
        break;
      }

      case "dahai": {
        const actorIndex = event.actor;
        const tileToDiscard = event.pai;
        
        const hand = [...newState.tehais[actorIndex]];
        const tileIdx = hand.indexOf(tileToDiscard);
        hand.splice(tileIdx, 1);
        newState.tehais[actorIndex] = sortTiles(hand);

        newState.discards[actorIndex] = [...newState.discards[actorIndex], tileToDiscard];
        break;
      }
    }

    setGameState(newState);
    setCursor(cursor + 1);
  };

  if (!gameState) return <div>Loading...</div>;

  return (
    <div className="app-container">
      <div className="controls-section">
        <div>Round: {gameState.bakaze}{gameState.kyoku} | Honba: {gameState.honba}</div>
        <button onClick={handleNext} disabled={cursor >= events.length}>
          Next ({cursor}/{events.length})
        </button>
      </div>

      <div className="table-grid">
        {/* Render Hands */}
        {gameState.tehais.map((hand, index) => {
          const areaMap = ["bottom", "right", "top", "left"];
          
          return (
            <div key={index} className={`placeholder-box area-hand-${areaMap[index]}`}>
              <div className={`hand-container ${areaMap[index]}`}>
                {hand.map((tileId, tIdx) => (
                  <Tile key={tIdx} id={tileId} size={index === 0 ? "50px" : "35px"} />
                ))}
              </div>
            </div>
          );
        })}

        {/* Center Info */}
        <div className="placeholder-box area-info">
          <div className="info-center">
            <p>Dora</p>
            <Tile id={gameState.dora_marker} size="40px" />
          </div>
        </div>

        {/* Discards */}
        {gameState.discards?.map((discards, index) => {
          const areaMap = ["bottom", "right", "top", "left"];
          return (
            <div key={`disc-${index}`} className={`placeholder-box area-disc-${areaMap[index]}`}>
              <div className={`discard-grid ${areaMap[index]}`}>
                {discards.map((tileId, tIdx) => (
                  <Tile key={tIdx} id={tileId} size="30px" />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;