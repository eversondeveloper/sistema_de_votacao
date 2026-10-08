import "./App.css";
import { VotingProvider } from "./context/VotingContext";
import SuperComputador from "./components/SuperComputador";
import Urna from "./components/Urna";
import Rodape from "./components/Rodape";

function App() {
  return (
    <VotingProvider>
      <div className="appContainer">
        <SuperComputador />
        <Urna />
        <Rodape />
      </div>
    </VotingProvider>
  );
}

export default App;