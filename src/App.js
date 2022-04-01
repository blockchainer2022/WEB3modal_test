/* eslint-disable no-unused-vars */
import "./App.css";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3Modal from "web3modal";
import { useEffect, useState } from "react";
import { contractAbi, contractAddress } from "./contracts/primary";
const providerOptions = {
  // binancechainwallet: {
  //   package: true,
  // },
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      rpc: {
        97: "https://data-seed-prebsc-1-s1.binance.org:8545/",
        56: "https://bsc-dataseed.binance.org/",
      },
      infuraId: "9a29c26a16574eb1b8b8959e8aba86ed", // required
      // network: "binance",
    },
  },
};

const web3Modal = new Web3Modal({
  cacheProvider: true,
  providerOptions,
});

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [contract, setContract] = useState(null);
  console.log(account, provider, chainId);

  const connectWallet = async () => {
    if (account) {
      //   // console.log(getInjectedProvider());
      await web3Modal.clearCachedProvider();
      window.location.reload();
    } else {
      const provider = await web3Modal.connect();
      await listenEvents(provider);
      const web3 = new Web3(provider);
      setProvider(provider);
      setWeb3(web3);
    }
  };
  const connectWallet2 = async (connect = "walletconnect") => {
    if (account) {
      //   // console.log(getInjectedProvider());
      await web3Modal.clearCachedProvider();
      window.location.reload();
    } else {
      const provider = await web3Modal.connectTo(connect);
      await listenEvents(provider);
      const web3 = new Web3(provider);
      setProvider(provider);
      setWeb3(web3);
    }
  };

  useEffect(() => {
    const connectedWallet = window.localStorage.getItem(
      "WEB3_CONNECT_CACHED_PROVIDER"
    );
    console.log(connectedWallet);
    if (connectedWallet === `"injected"`) {
      connectWallet();
    }
    if (connectedWallet === `"walletconnect"`) {
      console.log(true);
      connectWallet2();
    }

    if (provider) {
      listenEvents(provider);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const listenEvents = async (provider) => {
    const web3 = new Web3(provider);
    setWeb3(web3);

    const account = await web3.eth.getAccounts();
    const chainId = await web3.eth.getChainId();
    const _contract = new web3.eth.Contract(contractAbi, contractAddress);
    console.log("CONTRACT", _contract);
    setContract(_contract);
    console.log(chainId);
    setAccount(account[0]);
    setChainId(chainId);

    provider.on("accountsChanged", (accounts) => {
      setAccount(accounts.length === 0 ? undefined : accounts[0]);
      accounts.length === 0 && web3Modal.clearCachedProvider();
    });

    // Subscribe to chainId change
    provider.on("chainChanged", (chainId) => {
      console.log("chainId", chainId);
      setChainId(chainId ? chainId : undefined);
    });

    // Subscribe to provider connection
    provider.on("connect", (info) => {
      console.log("connect", info);
    });

    // Subscribe to provider disconnection
    provider.on("disconnect", (error) => {
      console.log("disconnect", error);
      window.location.reload();
    });
  };

  const referalAddresses = "0xcf63f107969f02c4391a1e7c061853c5de20b7b9";
  const invest = () => {
    if (contract) {
      if (chainId === 56) {
        contract.methods
          .invest(referalAddresses, 0)
          .send({
            from: account,
            value: Web3.utils.toWei(`${0.1}`, "ether"),
          })
          .on("error", function (error) {
            console.error("Error:", error);
          });
      } else {
        alert("Please connect to mainnet");
      }
    }
  };
  return (
    <div className="App text-white min-h-screen bg-slate-900 flex justify-center items-center">
      <div>
        <div className="grid grid-flow-col gap-x-8">
          <button
            onClick={connectWallet}
            className=" bg-gray-600 px-6 py-2 rounded-md "
          >
            CLICK ME
          </button>
          <button
            onClick={invest}
            className=" bg-gray-600 px-6 py-2 rounded-md "
          >
            INVEST
          </button>
        </div>
        <div className="flex justify-center">
          <p>ACCOUNT</p>:<p>{account}</p>
        </div>
        <div className="flex justify-center">
          <p>CHAIN ID</p>:<p>{chainId}</p>
        </div>
      </div>
    </div>
  );
}

export default App;
