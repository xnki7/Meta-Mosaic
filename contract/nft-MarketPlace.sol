//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract nftMarketPlace {

    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;
    address payable owner;
    uint256 listPrice = 0.5 ether;

    struct Token {
        uint256 tokenId;
        address payable owner;
        address payable seller;
        uint256 price;
        bool currentlyListed;
    }
    
    mapping (uint256 => Token) listedToken;
    Token [] allListedTokens;

    constructor() ERC721("NFTMarketplace", "NFTM") {
        owner = payable(msg.sender);
    }

    function createToken(string memory _tokenURI, uint256 _price) public payable {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);
        listToken(newTokenId, _price);
        _transfer(msg.sender, address(this), _tokenId);

        return newTokenId;
    }

    function listToken(uint256 _tokenId, uint256 _price) public payable {
        require(msg.value == listPrice, "Hopefully sending the correct price");
        require(price > 0, "Make sure the price isn't negative");

        listedToken[_tokenId] = Token(
            _tokenId,
            address(this),
            msg.sender,
            _price,
            true
        );
        allListedTokens.push(listedToken[_tokenId]);
    }

    function getAllTokens() public view returns(Token[]){
        return allListedTokens;
    }

    function sellToken(uint256 _tokenId) public payable{

        uint256 price = listedToken[_tokenId].price;
        address seller = listedToken[_tokenId].seller;
        require(msg.value == price, "Please submit the asking price in order to complete the purchase");

        _transfer(address(this), msg.sender, tokenId);
        approve(address(this), tokenId);
    }

}