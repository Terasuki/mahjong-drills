import Tile from './components/Tiles';
import './App.css'
import { useState, useEffect } from 'react';
import type { GameState, Event, DiscardTile } from './types';
import { sortTiles, getWind } from './utilities/mahjong';

function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [cursor, setCursor] = useState(0);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showAllHands, setShowAllHands] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const currentEvent = events[cursor];
  const isUsersTurn = currentEvent?.type === 'dahai' && currentEvent?.actor === 0;

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
            kyotaku: setup.kyotaku,
            honba: setup.honba,
            dora_marker: setup.dora_marker,
            oya: setup.oya,
            tehais: setup.tehais.map(hand => sortTiles(hand)),
            discards: [[], [], [], []],
            melds: [[], [], [], []],
            riichi: [false, false, false, false],
            isReaching: null,
            scores: setup.scores,
            type: 'start_kyoku',
          });
          setCursor(startIndex + 1);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const applyEventToState = (currentGS: GameState, event: Event): GameState => {
    const next = { ...currentGS };

    if (event.type === 'start_kyoku') {
        return {
          bakaze: event.bakaze,
          kyoku: event.kyoku,
          kyotaku: event.kyotaku,
          honba: event.honba,
          dora_marker: event.dora_marker,
          oya: event.oya,
          tehais: event.tehais.map(hand => sortTiles(hand)),
          discards: [[], [], [], []],
          melds: [[], [], [], []],
          riichi: [false, false, false, false],
          isReaching: null,
          scores: event.scores,
          type: 'start_kyoku',
        };
      }

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

      const discardObject: DiscardTile = { 
        id: event.pai, 
        sideways: next.isReaching === event.actor,
        tsumogiri: event.tsumogiri
      };

      newDiscards[event.actor] = [...newDiscards[event.actor], discardObject];
      return { ...next, tehais: newTehais, discards: newDiscards, isReaching: null };
    }

    if (event.type === 'reach') {
        return { ...next, isReaching: event.actor };
      }

    if (event.type === 'reach_accepted') {
      const newScores = [...next.scores];
      newScores[event.actor] -= 1000;
      const newRiichi = [...(next.riichi || [false, false, false, false])];
      newRiichi[event.actor] = true;
      
      return { ...next, scores: newScores, riichi: newRiichi, kyotaku: (next.kyotaku || 0) + 1 };
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
  };

  useEffect(() => {
    if (!currentEvent || isUsersTurn) return;

    const timer = setTimeout(() => {
      setGameState(prev => prev ? applyEventToState(prev, currentEvent) : null);
      setCursor(c => c + 1);
    }, 100);

    return () => clearTimeout(timer);
  }, [gameState, currentEvent, isUsersTurn]);

  const handlePlayerDiscard = (tileId: string) => {
    if (!isUsersTurn || !gameState || !currentEvent) return;

    if (currentEvent.type === 'dahai' && tileId !== currentEvent.pai) {
      console.log("corrent tile", currentEvent.pai);
      return
    }

    setGameState(prev => prev ? applyEventToState(prev, currentEvent) : null);
    setCursor(prev => prev + 1);
  };

  if (!gameState) return <div>Loading...</div>;

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="controls-section">
          <h2>Mahjong Trainer</h2>
          <div className={`status-indicator ${isUsersTurn ? 'active' : ''}`}>
           {isUsersTurn ? "👉 YOUR TURN" : "Opponent is thinking..."}
        </div>
          <button onClick={() => setIsPaused(!isPaused)}>
            {isPaused ? "Resume" : "Pause"}
          </button>
          <button 
            className="toggle-btn" 
            onClick={() => setShowAllHands(!showAllHands)}
            style={{ marginTop: '10px', backgroundColor: showAllHands ? '#4CAF50' : '#666' }}
          >
            {showAllHands ? "Hide Hands" : "Show All Hands"}
          </button>
        </div>
      </aside>

      <main className="game-area">
        <div className="table-grid-wrapper">
          <div className="table-grid">
            {gameState.tehais.map((hand, index) => {
              const areaMap = ['bottom', 'right', 'top', 'left'];
              const isPlayer0 = index === 0;
              const isHidden = !showAllHands && !isPlayer0;
              
              return (
                <div key={index} className={`placeholder-box area-hand-${areaMap[index]}`}>
                  <div className={`hand-container ${areaMap[index]}`}>
                    {hand.map((tileId, tIdx) => (
                      <div 
                        key={tIdx} 
                        onClick={() => handlePlayerDiscard(tileId)}
                        style={{ cursor: isUsersTurn ? 'pointer' : 'default' }}
                      >
                        <Tile id={tileId} isBack={isHidden} size='35px' />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {/* Center Info */}
            <div className="placeholder-box area-info">
              <div className="info-center">
                <div className="scores-grid">
                  {/* Top Player (Index 2) */}
                  <div className={`score-item top 
                    ${gameState.oya === 2 ? 'is-oya' : ''} 
                    ${gameState.riichi[2] ? 'is-riichi' : ''}`}>
                    ({getWind(2, gameState.oya)}) {gameState.scores[2]}
                  </div>

                  {/* Left Player (Index 3) */}
                  <div className={`score-item left 
                    ${gameState.oya === 3 ? 'is-oya' : ''} 
                    ${gameState.riichi[3] ? 'is-riichi' : ''}`}>
                    ({getWind(3, gameState.oya)}) {gameState.scores[3]}
                  </div>

                  {/* Center Round Info */}
                  <div className="round-info">
                    <div className="round-name">
                      {gameState.bakaze}{gameState.kyoku}-{gameState.honba}
                      {gameState.kyotaku > 0 && ` (+${gameState.kyotaku * 1000})`}
                    </div>
                    <div className="dora-display">
                      <Tile id={gameState.dora_marker} size="24px"/>
                    </div>
                  </div>

                  {/* Right Player (Index 1) */}
                  <div className={`score-item right 
                    ${gameState.oya === 1 ? 'is-oya' : ''} 
                    ${gameState.riichi[1] ? 'is-riichi' : ''}`}>
                    ({getWind(1, gameState.oya)}) {gameState.scores[1]}
                  </div>

                  {/* Bottom Player (Index 0) */}
                  <div className={`score-item bottom 
                    ${gameState.oya === 0 ? 'is-oya' : ''} 
                    ${gameState.riichi[0] ? 'is-riichi' : ''}`}>
                    ({getWind(0, gameState.oya)}) {gameState.scores[0]}
                  </div>
                </div>
              </div>
            </div>
            {/* Melds */}
            {gameState.melds.map((playerMelds, index) => {
            const callAreas = ['area-calls-br', 'area-calls-tr', 'area-calls-tl', 'area-calls-bl'];
            const areaMap = ['bottom', 'right', 'top', 'left'];
            
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
            {gameState.discards?.map((playerDiscards, index) => {
              const areaMap = ['bottom', 'right', 'top', 'left'];
              return (
                <div key={`disc-${index}`} className={`placeholder-box area-disc-${areaMap[index]}`}>
                  <div className={`discard-grid ${areaMap[index]}`}>
                    {playerDiscards.map((tile, tIdx) => (
                      <div 
                        key={tIdx} 
                        className={`discard-tile-wrapper ${tile.sideways ? 'riichi-sideways' : ''}`}
                      >
                        <Tile id={tile.id} size="30px" tsumogiri={tile.tsumogiri}/>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;