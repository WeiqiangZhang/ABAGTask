import "./App.css";
import Router from "./router/Router";
import { Web3Provider } from "./contexts/web3Provider";

const App = () => {
  return (
    <Web3Provider>
      <Router />
    </Web3Provider>
  );
};

export default App;