import React from "react";
import "./NFTmodal.css";
import { ethers } from "ethers";

function NFTmodal({ nft, contract, setSelectedNFT }) {
  const handleSale = async () => {
    try {
      const tx = await contract.executeSale(nft.tokenId.toString(), {
        value: nft.price.toString(),
        gasPrice: ethers.utils.parseUnits("150", "gwei"), // Adjust the gas price as per the current network conditions
        gasLimit: 900000, // Adjust the gas limit as per your contract requirements
      });
      await tx.wait();
    } catch (error) {
      console.error("Error executing sale:", error);
      // Handle the error here (e.g., display an error message to the user)
    }
  };

  return (
    <div className="NFTmodal">
      <div className="upperContent">
        <div className="left">
          <img src={`https://ipfs.io/ipfs/${nft.metadata.imageCID}`} alt="" />
        </div>
        <div className="right">
          <p className="title">
            {nft.metadata.name}#{nft.tokenId.toString()}
          </p>
          <p className="address">{nft.seller.toString()}</p>
          <p className="description">{nft.metadata.description}</p>
          <p className="price">
            Price : {nft.price.toString() / 1000000000000000000} MATIC
          </p>
          <button onClick={handleSale}>Buy</button>
        </div>
      </div>
      <div className="lowerContent"></div>
    </div>
  );
}

export default NFTmodal;
