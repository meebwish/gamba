import React, { useState } from "react";
import plus10 from "./assets/add_10.png";
import plus20 from "./assets/add_20.png";
import plus40 from "./assets/add_40.png";
import plus50 from "./assets/add_50.png";
import x2 from "./assets/times_2.png";
import x3 from "./assets/times_3.png";
import minus20 from "./assets/minus_20.png";
import minus30 from "./assets/minus_30.png";
import minus40 from "./assets/minus_40.png";
import minus50 from "./assets/minus_50.png";
import x05 from "./assets/divide_2.png";
import roulette from "./assets/gamba.gif";
import kmsdog from "./assets/kmsdog.webp";

function App() {
  const initialDeck = [
    ...Array(4).fill("+10%"),
    ...Array(3).fill("+20%"),
    ...Array(2).fill("+40%"),
    ...Array(2).fill("+50%"),
    ...Array(2).fill("x2"),
    "x3",
    ...Array(2).fill("-20%"),
    ...Array(2).fill("-30%"),
    "-40%",
    "-50%",
    "x0.5",
  ];

  const [deck, setDeck] = useState(initialDeck);
  const [drawnCards, setDrawnCards] = useState([]);
  const [value, setValue] = useState(100);
  const [history, setHistory] = useState([]);
  const [drawCount, setDrawCount] = useState(0);

  const cardImages = {
    "+10%": plus10,
    "+20%": plus20,
    "+40%": plus40,
    "+50%": plus50,
    "x2": x2,
    "x3": x3,
    "-20%": minus20,
    "-30%": minus30,
    "-40%": minus40,
    "-50%": minus50,
    "x0.5": x05,
  };

  const handleDrawCard = (card) => {
    if (drawCount >= 7) return;
    
    let newDeck = [...deck];
    const cardIndex = newDeck.indexOf(card);
    if (cardIndex > -1) {
      newDeck.splice(cardIndex, 1);
    }

    let newValue = value;
    if (card.startsWith("+")) {
      let effect = parseInt(card.replace("+", "").replace("%", ""));
      newValue += effect;
    } else if (card.startsWith("x")) {
      let multiplier = parseFloat(card.replace("x", ""));
      newValue = Math.max(100, newValue * multiplier);
    } else if (card.startsWith("-")) {
      let effect = parseInt(card.replace("-", "").replace("%", ""));
      newValue = Math.max(100, newValue - effect);
    }

   // Calculate the expected impact of the remaining cards
   let expectedImpact = newDeck.reduce((acc, c) => {
    if (c.startsWith("+")) {
      return acc + parseInt(c.replace("+", "").replace("%", ""));
    } else if (c.startsWith("x")) {
      let multiplier = parseFloat(c.replace("x", ""));
      let effect = newValue * multiplier;
      if (multiplier < 1) {
        if (newValue - effect <= 100) {
          effect = Math.min(effect, newValue - 100);
        }
        effect = -effect;
      } else {
        effect = effect - newValue;
      }
      return acc + effect; // Expected effect on current value
    } else if (c.startsWith("-")) {
      let effect = parseInt(c.replace("-", "").replace("%", ""));
      if (newValue - effect <= 100) {
        effect = Math.min(effect, newValue - 100);
      }
      return acc - effect;
    }
    return acc;
  }, 0);

  let avgRemainingImpact = expectedImpact / newDeck.length || 0;

    let shouldContinue = avgRemainingImpact >= 0;
    let advice = shouldContinue
      ? "Continue drawing cards"
      : "Stop drawing cards";

    setHistory([
      ...history,
      {
        card,
        value: newValue,
        avgRemainingImpact: avgRemainingImpact,
        advice,
      },
    ]);
    setDeck(newDeck);
    setValue(newValue);
    setDrawnCards([...drawnCards, card]);
    setDrawCount(drawCount + 1);
  };

  const handleReset = () => {
    setDeck(initialDeck);
    setDrawnCards([]);
    setValue(100);
    setHistory([]);
    setDrawCount(0);
  };

  const uniqueCards = Array.from(new Set(initialDeck));

  return (
    <div>
      <h1>Card Draw Simulator</h1>
      <button onClick={handleReset}>Reset Game</button>
      <div>
        <h2>Draw Cards</h2>
        <div style={{ display: "flex", gap: "10px" }}>
          {uniqueCards.map((card, index) => {
            const cardCount = deck.filter((c) => c === card).length;
            const probability = ((cardCount / deck.length) * 100).toFixed(2);
            let test = card
            if (card.startsWith("-")) {
              let effect = parseInt(card.replace("-", "").replace("%", ""));
              test = `-${Math.min(effect, value - 100)}%`;
            }
            if (card == "x2" || card == "x3") {
              let multiplier = parseFloat(card.replace("x", ""));
              let effect = value * multiplier;
              test = `+${effect}%`;
            }
            if (card == "x0.5") {
              let multiplier = parseFloat(card.replace("x", ""));
              let effect = value * multiplier;
              test = `-${Math.min(effect, value - 100)}%`;
            }
            return (
              cardCount > 0 && (
                <div key={index} style={{ textAlign: "center" }}>
                  <p>{test}</p>
                  <img
                    src={cardImages[card]}
                    alt={card}
                    onClick={() => handleDrawCard(card)}
                    style={{ width: "80px", height: "120px", cursor: "pointer" }}
                    disabled={drawCount >= 7}
                  />
                  <div>{cardCount} left</div>
                  <div>{probability}% to get</div>
                </div>
              )
            );
          })}
        </div>
      </div>
      <h2>Drawn Cards</h2>
      <ul>
        {history.map((entry, index) => (
          <li key={index}>
          {`Card ${index + 1}: ${entry.card} -> Value: ${entry.value.toFixed(
            2
          )}% | Estimate Value of Next Card: ${entry.avgRemainingImpact.toFixed(
            2
          )} | Draw?: ${entry.advice}`}
        </li>
      ))}
      </ul>
      <h2>Final Value: {value.toFixed(2)}%</h2>
      <h2>{drawCount >= 7 ? "It's Joever" : "Keep Going?"}
      {history.length > 0 && (
        <img
          src={history[history.length - 1].advice === "Continue drawing cards" ? roulette : kmsdog}
          alt={history[history.length - 1].advice}
          style={{ width: "200px", height: "200px" }}
        />
      )}
      </h2>
    </div>
  );
}

export default App;
