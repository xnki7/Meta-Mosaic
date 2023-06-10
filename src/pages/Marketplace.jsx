import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from "axios";

function Marketplace({ contract }) {
  const [nfts, setNfts] = useState([]);

  useEffect(() => {
    if (contract) {
      getAllNFTs();
    }
  }, [contract]);

  const getAllNFTs = async () => {
    const tx = await contract.getAllNFTs();
    setNfts(tx);
  };

  const fetchNFTMetadata = async (tokenURI) => {
    try {
      const response = await axios.get(
        `https://ipfs.io/ipfs/${tokenURI}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching NFT metadata:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchNFTDetails = async () => {
      const updatedNFTs = await Promise.all(
        nfts.map(async (nft) => {
          const uri = await contract.tokenURI(nft.tokenId);
          const metadata = await fetchNFTMetadata(uri);
          console.log("Metadata for tokenId", nft.tokenId, ":", metadata);
          return { ...nft, metadata };
        })
      );
      console.log("Updated NFTs:", updatedNFTs);
      setNfts(updatedNFTs);
    };

    const fetchNFTs = async () => {
      if (nfts.length > 0 && !nfts[0].metadata) {
        await fetchNFTDetails();
      }
    };

    fetchNFTs();
  }, [nfts]); // Wrap `nfts` in a function

  return (
    <div className="Marketplace">
      {nfts.length > 0 ? (
        nfts
          .slice(0)
          .reverse()
          .map((nft) => (
            <div key={nft.tokenId}>
              <h2>{nft.tokenId.toString()}</h2>
              {nft.metadata ? (
                <div>
                  <h3>{nft.metadata.name}</h3>
                  <p>{nft.metadata.description}</p>
                  <img src={`https://ipfs.io/ipfs/${nft.metadata.imageCID}`} alt={nft.metadata.name} />
                </div>
              ) : (
                <p>Loading metadata...</p>
              )}
            </div>
          ))
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default Marketplace;
