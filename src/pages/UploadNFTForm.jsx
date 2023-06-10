import React, { useState } from "react";
import axios from "axios";
import { ethers } from "ethers";

const UploadNFTForm = ({ contract }) => {
  const [nftName, setNFTName] = useState("");
  const [nftDescription, setNFTDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    setImage(file);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", image);

      const imageUploadResponse = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            pinata_api_key: "6cd3c58633b351f064d8",
            pinata_secret_api_key:
              "81adfa6c6ee60d6c9e84d600bda1689c67f53a7bc84f8d71f72e32e89f6f837f",
          },
        }
      );

      const nftData = {
        name: nftName,
        description: nftDescription,
        imageCID: imageUploadResponse.data.IpfsHash,
      };

      const nftUploadResponse = await axios.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        nftData,
        {
          headers: {
            pinata_api_key: "6cd3c58633b351f064d8",
            pinata_secret_api_key:
              "81adfa6c6ee60d6c9e84d600bda1689c67f53a7bc84f8d71f72e32e89f6f837f",
          },
        }
      );

      // const provider = new ethers.providers.Web3Provider(window.ethereum);
      // await provider.send("eth_requestAccounts", []);
      // const signer = provider.getSigner();
      // const contract = new ethers.Contract(
      //   contractAddress,
      //   contractAbi,
      //   signer
      // );
      let listingPrice = await contract.getListPrice();
      listingPrice = listingPrice.toString();
      const tx = await contract.createToken(
        nftUploadResponse.data.IpfsHash,
        ethers.utils.parseEther(price),
        { gasLimit: 500000, value: listingPrice }
      );

      await tx.wait();

      setNFTName("");
      setNFTDescription("");
      setPrice("");
      setImage(null);
    } catch (error) {
      console.error("Error uploading and minting NFT:", error);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <label>
        NFT Name:
        <input
          type="text"
          value={nftName}
          onChange={(e) => setNFTName(e.target.value)}
          required
        />
      </label>
      <br />
      <label>
        NFT Description:
        <textarea
          value={nftDescription}
          onChange={(e) => setNFTDescription(e.target.value)}
          required
        />
      </label>
      <br />
      <label>
        Price (in Ether):
        <input
          type="text"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      </label>
      <br />
      <label>
        Image:
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          required
        />
      </label>
      <br />
      <button type="submit" disabled={loading}>
        {loading ? "Uploading..." : "Submit"}
      </button>
    </form>
  );
};

export default UploadNFTForm;
