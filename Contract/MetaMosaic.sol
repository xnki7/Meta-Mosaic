//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFTMarketplace is ERC721URIStorage {

    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;

    Counters.Counter private _itemsSold;
    Counters.Counter private _itemsListed;

    address payable owner;

    uint256 listPrice = 0.05 ether;

    struct ListedToken {
        uint256 tokenId;
        address payable owner;
        address payable seller;
        uint256 price;
        bool currentlyListed;
    }

    struct tokenHistory {
        uint256 tokenId;
        address soldTo;
        address soldBy;
        string message;
        uint256 timeStamp;
    }


    event TokenListedSuccess (
        uint256 indexed tokenId,
        address owner,
        address seller,
        uint256 price,
        bool currentlyListed
    );


    tokenHistory[] public historyArray;

   
    mapping(uint256 => ListedToken) private idToListedToken;

    mapping(uint256 => tokenHistory) public idToTokenHistory;
    mapping(uint256 => tokenHistory[]) public idToHistoryArray;
    mapping(uint256 => uint256) public idToVolumeTraded;
    mapping(uint256 => address) public idToCreator;


    constructor() ERC721("MetaMosiac", "MM") {
        owner = payable(msg.sender);
    }

    function getCreator (uint256 _tokenId) public view returns(address){
        return idToCreator[_tokenId];
    }

    function updateListPrice(uint256 _listPrice) public payable {
        require(owner == msg.sender, "Only owner can update listing price");
        listPrice = _listPrice;
    }

    function getNftVolume(uint256 _tokenId) public view returns(uint256){
        return idToVolumeTraded[_tokenId];
    }

    function getTokenHistory(uint256 _tokenId) public view returns(tokenHistory[] memory){
        return(idToHistoryArray[_tokenId]);
    }

    function getListPrice() public view returns (uint256) {
        return listPrice;
    }

    function getLatestIdToListedToken() public view returns (ListedToken memory) {
        uint256 currentTokenId = _tokenIds.current();
        return idToListedToken[currentTokenId];
    }

    function getListedTokenForId(uint256 tokenId) public view returns (ListedToken memory) {
        return idToListedToken[tokenId];
    }

    function getCurrentToken() public view returns (uint256) {
        return _tokenIds.current();
    }

    function addressChecker(uint256 _tokenId) public view returns(bool){
        if(idToListedToken[_tokenId].seller == msg.sender || idToListedToken[_tokenId].owner == msg.sender){
            return true;
        }
        else{
            return false;
        }
    }

    function isCurrentlyListed(uint _tokenId) public view returns(bool){
        return idToListedToken[_tokenId].currentlyListed;
    }


    function createToken(string memory tokenURI, uint256 price) public payable returns (uint) {
        
        _tokenIds.increment();
        _itemsListed.increment();
        uint256 newTokenId = _tokenIds.current();

        idToCreator[newTokenId] = msg.sender;
       
        _safeMint(msg.sender, newTokenId);

        _setTokenURI(newTokenId, tokenURI);

        createListedToken(newTokenId, price);

        return newTokenId;
    }

    function createListedToken(uint256 tokenId, uint256 price) private {
   
        require(msg.value == listPrice, "Hopefully sending the correct price");
       
        require(price > 0, "Make sure the price isn't negative");

       
        idToListedToken[tokenId] = ListedToken(
            tokenId,
            payable(address(this)),
            payable(msg.sender),
            price,
            true
        );

        _transfer(msg.sender, address(this), tokenId);
        idToTokenHistory[tokenId] = tokenHistory(tokenId, address(this), msg.sender, "Token Created", block.timestamp);
        idToHistoryArray[tokenId].push(idToTokenHistory[tokenId]);
       
        emit TokenListedSuccess(
            tokenId,
            address(this),
            msg.sender,
            price,
            true
        );
    }
    
 
    function getAllNFTs() public view returns (ListedToken[] memory) {
        uint nftCount2 = _tokenIds.current();
        uint nftCount = _itemsListed.current();
        ListedToken[] memory tokens = new ListedToken[](nftCount);
        uint currentIndex = 0;
        uint currentId;
       
        for(uint i=0;i<nftCount2;i++)
        {
            if(idToListedToken[currentId+1].currentlyListed == true){
                currentId = i + 1;
                ListedToken storage currentItem = idToListedToken[currentId];
                tokens[currentIndex] = currentItem;
                currentIndex += 1;
            }
            else{
                currentId = i + 1;
            }
        }
        
        return tokens;
    }
    
    
    function getMyNFTs() public view returns (ListedToken[] memory) {
        uint totalItemCount = _tokenIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;
        uint currentId;
        
        for(uint i=0; i < totalItemCount; i++)
        {
            if(idToListedToken[i+1].owner == msg.sender || idToListedToken[i+1].seller == msg.sender){
                itemCount += 1;
            }
        }

        
        ListedToken[] memory items = new ListedToken[](itemCount);
        for(uint i=0; i < totalItemCount; i++) {
            if(idToListedToken[i+1].owner == msg.sender || idToListedToken[i+1].seller == msg.sender) {
                currentId = i+1;
                ListedToken storage currentItem = idToListedToken[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    function executeSale(uint256 tokenId) public payable {
        require(idToListedToken[tokenId].currentlyListed, "Token is not currently listed");
        require(msg.value == idToListedToken[tokenId].price, "Please send the correct amount");

        ListedToken memory listedToken = idToListedToken[tokenId];
        address payable seller = listedToken.seller;

        idToVolumeTraded[tokenId] = idToVolumeTraded[tokenId] + idToListedToken[tokenId].price;

        _itemsSold.increment();
        _itemsListed.decrement();
        idToListedToken[tokenId].currentlyListed = false;
        idToHistoryArray[tokenId].push(tokenHistory(tokenId, msg.sender, seller, "Token Sold", block.timestamp));

        seller.transfer(msg.value);
        _transfer(address(this), msg.sender, tokenId);

        idToListedToken[tokenId] = ListedToken(
            tokenId,
            payable(msg.sender),
            payable(address(this)),
            0,
            false
        );
    }


    function reListToken(uint256 tokenId, uint256 price) public payable returns (uint) {
        
        _itemsListed.increment();
        
        updateListedToken(tokenId, price);

        return tokenId;
    }

    function updateListedToken(uint256 tokenId, uint256 price) private {
        
        require(msg.value == listPrice, "Hopefully sending the correct price");
        require(price > 0, "Make sure the price isn't negative");
        idToListedToken[tokenId] = ListedToken(
            tokenId,
            payable(address(this)),
            payable(msg.sender),
            price,
            true
        );

        _transfer(msg.sender, address(this), tokenId);
        idToTokenHistory[tokenId] = tokenHistory(tokenId, address(this), msg.sender, "Token Relisted", block.timestamp);
        idToHistoryArray[tokenId].push(idToTokenHistory[tokenId]);
        
        emit TokenListedSuccess(
            tokenId,
            address(this),
            msg.sender,
            price,
            true
        );
    }
}