import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import Main from "./Main";


const App = () => (
  <DynamicContextProvider
    theme="auto"
    settings={{
      environmentId: "4e598b41-f388-489b-a0b3-d24064b1d1ed",
      walletConnectors: [EthereumWalletConnectors],
    }}
  >
    <Main />
  </DynamicContextProvider>
);

export default App;