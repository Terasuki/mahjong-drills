import Tile from './components/Tiles';
import './App.css'
import { useState, useEffect } from 'react';

import type { GameState } from './types';
import { sortTiles } from './utilities/mahjong';

function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
  fetch('/test.json')
    .then((res) => res.text())
    .then((data) => {
      const lines = data.trim().split('\n');
      
      const setupLine = lines.find(line => {
        const parsed = JSON.parse(line);
        return parsed.type === "start_kyoku";
      });

      if (setupLine) {
        setGameState(JSON.parse(setupLine));
      } else {
        console.error("Could not find a 'start_kyoku' event in the file.");
      }
    })
    .catch((err) => console.error("Fetch error:", err));
}, []);

  if (!gameState) return <div>Loading tiles...</div>;

  return (
    <div className="app-container">
      <div className="controls-section">
        Round: {gameState.bakaze}{gameState.kyoku} | Honba: {gameState.honba}
      </div>

      <div className="table-grid">
        {/* Hands */}
        {gameState.tehais.map((hand, index) => {
          // Map index to the CSS grid area names
          const areaMap = ["bottom", "right", "top", "left"];
          const sortedHand = sortTiles(hand);
          return (
            <div key={index} className={`placeholder-box area-hand-${areaMap[index]}`}>
              <div className={`hand-container ${areaMap[index]}`}>
                {sortedHand.map((tileId, tIdx) => (
                  <Tile key={tIdx} id={tileId} size={index === 0 ? "50px" : "35px"} />
                ))}
              </div>
            </div>
          );
        })}

        {/* Discards (Empty for now) */}
        <div className="placeholder-box area-disc-top"></div>
        <div className="placeholder-box area-disc-right"></div>
        <div className="placeholder-box area-disc-bottom"></div>
        <div className="placeholder-box area-disc-left"></div>

        {/* Center Info */}
        <div className="placeholder-box area-info">
          <div className="info-center">
            <p>Dora</p>
            <Tile id={gameState.dora_marker} size="40px" />
          </div>
        </div>

        {/* Calls (Empty) */}
        <div className="area-calls-tl"></div>
        <div className="area-calls-tr"></div>
        <div className="area-calls-br"></div>
        <div className="area-calls-bl"></div>
      </div>
    </div>
  );
}

export default App