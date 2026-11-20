// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {AgentSenate} from "../src/AgentSenate.sol";

/// Usage:
///   export AGENT_ID=<Agent ID contract address, copied from the official campaign page>
///   forge script script/Deploy.s.sol --rpc-url $BSC_RPC --private-key $PK --broadcast
contract Deploy is Script {
    function run() external returns (AgentSenate senate) {
        address agentId = vm.envAddress("AGENT_ID");
        vm.startBroadcast();
        senate = new AgentSenate(agentId);
        vm.stopBroadcast();
        console.log("AgentSenate deployed at:", address(senate));
    }
}
