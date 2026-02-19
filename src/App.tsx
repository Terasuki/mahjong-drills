import Tile from './components/Tiles';
import './App.css'
import { useState, useEffect } from 'react';
import type { GameState, Event } from './types';
import { sortTiles, getWind } from './utilities/mahjong';

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
            melds: [[], [], [], []],
            scores: setup.scores,
            type: 'start_kyoku',
          });
          setCursor(startIndex + 1);
        }
      })
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  const handleNext = () => {
    const event = events[cursor];
    if (!event || !gameState) return;

    setGameState((prev) => {
      if (!prev) return null;
      const next = { ...prev };

      if (event.type === 'tsumo') {
        const newTehais = [...next.tehais];
        newTehais[event.actor] = [...newTehais[event.actor], event.pai];
        return { ...next, tehais: newTehais };
      }

      if (event.type === 'dahai') {
        const newTehais = [...next.tehais];
        const newDiscards = [...next.discards];
        
        const hand = [...newTehais[event.actor]];
        const idx = hand.indexOf(event.pai);
        if (idx > -1) {
          hand.splice(idx, 1);
          newTehais[event.actor] = sortTiles(hand);
        }

        newDiscards[event.actor] = [...newDiscards[event.actor], event.pai];
        return { ...next, tehais: newTehais, discards: newDiscards };
      }
      if (event.type === 'pon' || event.type === 'chi') {
        const { actor, pai, consumed, target } = event;
        const newTehais = [...next.tehais];
        const hand = [...newTehais[actor]];
        consumed.forEach(cTile => {
          const idx = hand.indexOf(cTile);
          if (idx > -1) hand.splice(idx, 1);
        });
        newTehais[actor] = sortTiles(hand);
        const newDiscards = [...next.discards];
        if (newDiscards[target].length > 0) {
          newDiscards[target] = newDiscards[target].slice(0, -1);
        }

        const newMelds = [...next.melds];
        newMelds[actor] = [...newMelds[actor], [pai, ...consumed]];

        return { ...next, tehais: newTehais, discards: newDiscards, melds: newMelds };
      }

      return next;
    });

    setCursor(cursor + 1);
  };

  if (!gameState) return <div>Loading...</div>;

  return (
    <div className="app-container">
      <div className="controls-section">
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
          <div className="scores-grid">
            <div className={`score-item top ${gameState.oya === 2 ? 'is-oya' : ''}`}>
              ({getWind(2, gameState.oya)}) {gameState.scores[2]}
            </div>
            
            <div className="middle-row">
              <div className={`score-item left ${gameState.oya === 3 ? 'is-oya' : ''}`}>
                ({getWind(3, gameState.oya)}) {gameState.scores[3]}
              </div>
              
              <div className="round-info">
                <div className="round-name">{gameState.bakaze}{gameState.kyoku}-{gameState.honba}</div>
                <div className="dora-display">
                  <span>Dora</span>
                  <Tile id={gameState.dora_marker} size="30px" />
                </div>
              </div>

              <div className={`score-item right ${gameState.oya === 1 ? 'is-oya' : ''}`}>
                ({getWind(1, gameState.oya)}) {gameState.scores[1]}
              </div>
            </div>

            <div className={`score-item bottom ${gameState.oya === 0 ? 'is-oya' : ''}`}>
              ({getWind(0, gameState.oya)}) {gameState.scores[0]}
            </div>
          </div>
        </div>
      </div>
        {/* Melds */}
        {gameState.melds.map((playerMelds, index) => {
        const callAreas = ["area-calls-br", "area-calls-tr", "area-calls-tl", "area-calls-bl"];
        const areaMap = ["bottom", "right", "top", "left"];
        
        return (
          <div key={`meld-player-${index}`} className={`placeholder-box ${callAreas[index]}`}>
            <div className={`melds-container ${areaMap[index]}`}>
              {playerMelds.map((meld, mIdx) => (
                <div key={mIdx} className="meld-group">
                  {meld.map((tileId, tIdx) => (
                    <Tile key={tIdx} id={tileId} size="30px" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        );
      })}

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