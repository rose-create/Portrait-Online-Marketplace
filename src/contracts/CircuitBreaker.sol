pragma solidity ^0.5.0;

contract CircuitBreaker {

    bool public stopped = false;

    modifier stopInEmergency {
        //require(!stopped);
        _;
    }
    modifier onlyInEmergency {
        //require(stopped);
        _;
    }

    function deposit() stopInEmergency public {
        
    }
    function withdraw() onlyInEmergency public {
        
    } 
}