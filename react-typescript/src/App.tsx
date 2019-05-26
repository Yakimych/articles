import React, { useState, useEffect } from "react";
import {
  numberFact as NumberFact,
  fetchNumberFact
} from "./reason/NumberFacts.gen";
import { TestComponent } from "./TestComponent";

import "./App.css";

const App: React.FC = () => {
  const [numberFact, setNumberFact] = useState<NumberFact | null>(null);

  const fetchNewFact = () =>
    fetchNumberFact()
      .then(newFact => setNumberFact(newFact))
      .catch(e => console.log("Error fetching number fact: ", e));

  useEffect(() => {
    fetchNewFact();
  }, []);

  return (
    <div className="App">
      <TestComponent />
      {numberFact === null ? (
        "Loading initial number fact..."
      ) : (
        <div className="number-fact">
          <div>Number: {numberFact.number}</div>
          <div>Fact: "{numberFact.text}"</div>
          <div>{numberFact.isFound ? "Found" : "Not found!"}</div>
          <button onClick={fetchNewFact}>Fetch new fact</button>
        </div>
      )}
    </div>
  );
};

export default App;
