import React, { useState, useEffect } from "react";
import NFTcard from "../components/NFTcard";
import "./Marketplace.css";
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
      const response = await axios.get(`https://ipfs.io/ipfs/${tokenURI}`);
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
    <>
      <div className="Marketplace">
        <div className="NFTitems">
          {nfts.length > 0 ? (
            nfts
              .slice(0)
              .reverse()
              .map((nft) => (
                <>
                  {nft.metadata ? (
                    <NFTcard
                      key={nft.tokenId}
                      id={nft.tokenId.toString()}
                      title={nft.metadata.name}
                      description={nft.metadata.description}
                      img={`https://ipfs.io/ipfs/${nft.metadata.imageCID}`}
                      price={nft.price.toString()}
                      seller={nft.seller.toString()}
                    />
                  ) : (
                    <p>Loading metadata...</p>
                  )}
                </>
              ))
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
    </>
  );
}

export default Marketplace;
