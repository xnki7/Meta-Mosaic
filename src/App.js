import "./App.css";
import { useState, useEffect } from "react";
import UploadNFTForm from "./pages/UploadNFTForm";
import Marketplace from "./pages/Marketplace";
import Navbar from "./components/navbar";
import MyNFTs from "./pages/MyNFTs";
import { contractAddress, contractAbi } from "./constant";
import { ethers } from "ethers";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    loadBcData();
  }, []);

  const networks = {
    polygon: {
      chainId: `0x${Number(80001).toString(16)}`,
      chainName: "Polygon Testnet",
      nativeCurrency: {
        name: "MATIC",
        symbol: "MATIC",
        decimals: 18,
      },
      rpcUrls: ["https://rpc-mumbai.maticvigil.com/"],
      blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
    },
  };

  async function loadBcData() {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(
        window.ethereum,
        "any"
      );
      setProvider(provider);
      const signer = provider.getSigner();
      setSigner(signer);
      const contractInstance = new ethers.Contract(
        contractAddress,
        contractAbi,
        signer
      );
      setContract(contractInstance);
    }
  }

  async function connectWallet() {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        if (provider.network.chainId !== networks.polygon.chainId) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [networks.polygon],
          });
        }
        const address = await signer.getAddress();
        console.log("Metamask Connected to " + address);
        setAccount(address);
        setIsConnected(true);
      } catch (err) {
        console.log(err);
      }
    }
  }

  return (
    <div className="App">
      <Navbar connectWallet={connectWallet} account={account} />
      
      <Routes>
        <Route path="/" element={<Marketplace contract={contract} isConnected={isConnected}/>} />
        <Route
          path="/MyNFTs"
          element={<MyNFTs contract={contract} isConnected={isConnected} />}
        />
        <Route
          path="/UploadNFTForm"
          element={<UploadNFTForm contract={contract} />}
        />
      </Routes>
    </div>
  );
}

export default App;
