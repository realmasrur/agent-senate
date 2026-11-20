// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
// For trying AgentSenate in Remix VM only. Never deploy to mainnet.
contract TestAgentID {
    mapping(address => uint256) public balanceOf;
    function mint(address to) external { balanceOf[to] = 1; }
}
