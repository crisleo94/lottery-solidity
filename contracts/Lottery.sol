// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

contract Lottery {
    address public manager_address;
    address[] public players;
    address public winner;

    constructor() {
        manager_address = msg.sender;
    }

    function enter() public payable {
        require(msg.value > 0.01 ether);

        players.push(msg.sender);
    }

    function pickWinner() public payable restricted {
        uint256 index = random() % players.length;
        payable(players[index]).transfer(address(this).balance);
        winner = players[index];
        delete players;
    }

    function random() private view returns (uint256) {
        return
            uint256(
                keccak256(
                    abi.encodePacked(block.difficulty, block.timestamp, players)
                )
            );
    }

    function getPlayers() public view returns (address[] memory) {
        return players;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    modifier restricted() {
        require(msg.sender == manager_address);
        _;
    }
}
