pragma solidity ^0.5.0;
import "./SafeMath.sol";
import "./CircuitBreaker.sol";

contract Marketplace {
    
    using SafeMath for uint256;
    uint256 public nbCreatedPortrait = 0;
    uint256 public nbPurchasedPortrait = 0;

    string public name;
    uint public portraitCount = 0;
    mapping(uint => Portrait) public portraits;

    struct Portrait {
        uint id;
        string name;
        uint price;
        address payable owner;
        bool purchased;
    }

    event PortraitCreated(
        uint id,
        string name,
        uint price,
        address payable owner,
        bool purchased
    );

    event PortraitPurchased(
        uint id,
        string name,
        uint price,
        address payable owner,
        bool purchased
    );

    constructor() public {
        name = "Portrait Online Marketplace";
    }

    function createPortrait(string memory _name, uint _price) public {
        // Require a valid name
        require(bytes(_name).length > 0);
        // Require a valid price
        require(_price > 0);
        // Increment portrait count
        portraitCount ++;
        // Create the portrait
        portraits[portraitCount] = Portrait(portraitCount, _name, _price, msg.sender, false);
        // Trigger an event
        emit PortraitCreated(portraitCount, _name, _price, msg.sender, false);
        nbCreatedPortrait++;
        CircuitBreaker cb = new CircuitBreaker();
        cb.deposit();
    }

    function purchasePortrait(uint _id) public payable {
        // Fetch the portrait
        Portrait memory _portrait = portraits[_id];
        // Fetch the owner
        address payable _seller = _portrait.owner;
        // Make sure the portrait has a valid id
        require(_portrait.id > 0 && _portrait.id <= portraitCount);
        // Require that there is enough Ether in the transaction
        require(msg.value >= _portrait.price);
        // Require that the portrait has not been purchased already
        require(!_portrait.purchased);
        // Require that the buyer is not the seller
        require(_seller != msg.sender);
        // Transfer ownership to the buyer
        _portrait.owner = msg.sender;
        // Mark as purchased
        _portrait.purchased = true;
        // Update the portrait
        portraits[_id] = _portrait;
        // Pay the seller by sending them Ether
        address(_seller).transfer(msg.value);
        // Trigger an event
        emit PortraitPurchased(portraitCount, _portrait.name, _portrait.price, msg.sender, true);
        nbPurchasedPortrait++;
        CircuitBreaker cb = new CircuitBreaker();
        cb.withdraw();
    }
}
