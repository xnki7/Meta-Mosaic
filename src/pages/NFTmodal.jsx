import React, { useEffect, useState } from "react";
import "./NFTmodal.css";
import { ethers } from "ethers";

function NFTmodal({ nft, contract, setSelectedNFT }) {
  const [history, setHistory] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [listed, setListed] = useState(false);
  const [price, setPrice] = useState(null);
  const [volume, setVolume] = useState(0);

  useEffect(() => {
    getHistory(nft.tokenId.toString());
    IsOwner(nft.tokenId.toString());
    listStatus(nft.tokenId.toString());
    getVolume(nft.tokenId.toString());
  }, [nft.tokenId]);

  const getHistory = async (tokenId) => {
    const tx = await contract.getTokenHistory(tokenId);
    setHistory(tx);
  };

  const getVolume = async (tokenId) => {
    const tx = await contract.getNftVolume(tokenId);
    setVolume(tx);
  };

  const Relist = async () => {
    const tx = await contract.reListToken(
      nft.tokenId.toString(),
      ethers.utils.parseEther(price)
    );
    await tx.wait();
  };

  const IsOwner = async (tokenId) => {
    const tx = await contract.addressChecker(tokenId);
    setIsOwner(tx);
  };

  const listStatus = async (tokenId) => {
    const tx = await contract.isCurrentlyListed(tokenId);
    setListed(tx);
  };

  const handleSale = async () => {
    try {
      const tx = await contract.executeSale(nft.tokenId.toString(), {
        value: nft.price.toString(),
        gasPrice: ethers.utils.parseUnits("150", "gwei"),
        gasLimit: 900000,
      });
      await tx.wait();
    } catch (error) {
      console.error("Error executing sale:", error);
    }
  };

  const convertTimestampToDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
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

          <p className="address">{nft.seller.toString().slice(0, 6)+ "..." +nft.seller.toString().slice(38, 42)}</p>
          <p className="description">{nft.metadata.description}</p>
          <p className="volume">
            Volume: {volume.toString() / 1000000000000000000} MATIC
          </p>
          {!isOwner ? (
            <p className="price">
              Price: {nft.price.toString() / 1000000000000000000} MATIC
            </p>
          ) : (
            <></>
          )}
          {isOwner && listed ? (
            <>
              <input
                type="text"
                name=""
                id=""
                placeholder="Enter price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <button onClick={Relist}>Relist</button>
            </>
          ) : isOwner && !listed ? (
            <>
              <input
                type="text"
                name=""
                id=""
                placeholder="Enter price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <button onClick={Relist}>Sell</button>
            </>
          ) : (
            <button onClick={handleSale}>Buy</button>
          )}
        </div>
      </div>
      <div className="lowerContent">
        <div className="history">
          <table>
            <thead>
              <tr>
                <th>From</th>
                <th>To</th>
                <th>Event</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {history.length > 0 ? (
                history
                  .slice(0)
                  .reverse()
                  .map((historyItem, index) => (
                    <tr key={index}>
                      <td>{historyItem.soldBy.toString()}</td>
                      <td>{historyItem.soldTo.toString()}</td>
                      <td>{historyItem.message.toString()}</td>
                      <td>{convertTimestampToDate(historyItem.timeStamp)}</td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="4">No history available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default NFTmodal;
