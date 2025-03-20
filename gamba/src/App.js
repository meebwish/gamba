import React, { useState } from "react";

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
  const [drawCount, setDrawCount] = useState(0); // Track the number of draws

  const handleDrawCard = (card) => {
    if (drawCount >= 7) return; // Stop drawing after 7 cards

    // Remove the drawn card from the deck
    let newDeck = [...deck];
    const cardIndex = newDeck.indexOf(card);
    if (cardIndex > -1) {
      newDeck.splice(cardIndex, 1);
    }

    // Update value based on the drawn card
    let newValue = value;
    if (card.startsWith("+")) {
      let effect = parseInt(card.replace("+", "").replace("%", ""));
      newValue += effect;
    } else if (card.startsWith("x")) {
      let multiplier = parseFloat(card.replace("x", ""));
      newValue = Math.max(100, newValue * multiplier); // Apply x multiplier but with a max of 100%
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

    let shouldContinue = avgRemainingImpact > 0;
    let advice = shouldContinue
      ? "Continue drawing cards"
      : "Stop drawing cards";

    // Update the history of drawn cards and value
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
    setDrawCount(drawCount + 1); // Increase draw count
  };

  const handleReset = () => {
    setDeck(initialDeck);
    setDrawnCards([]);
    setValue(100);
    setHistory([]);
    setDrawCount(0); // Reset draw count
  };

  // Create a set of unique card types
  const uniqueCards = Array.from(new Set(initialDeck));

  return (
    <div>
      <h1>Card Draw Simulator</h1>
      <div>
        <h2>Draw Cards</h2>
        <div>
          {uniqueCards.map((card, index) => {
            const cardCount = deck.filter((c) => c === card).length;
            return (
              cardCount > 0 && (
                <button
                  key={index}
                  onClick={() => handleDrawCard(card)}
                  disabled={drawCount >= 7}
                >
                  {card} ({cardCount} left)
                </button>
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
            )}% | Average Remaining Impact: ${entry.avgRemainingImpact.toFixed(
              2
            )} | Heuristic: ${entry.advice}`}
          </li>
        ))}
      </ul>
      <h2>Final Value: {value.toFixed(2)}%</h2>

      <button onClick={handleReset}>Reset Game</button>
    </div>
  );
}

export default App;
