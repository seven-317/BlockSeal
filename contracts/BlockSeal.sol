// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title BlockSeal
/// @notice Records ciphertext integrity hashes on-chain. No plaintext ever touches the chain.
contract BlockSeal {
    event Sealed(
        bytes32 indexed id,
        bytes32 ciphertextHash,
        address indexed sender,
        uint256 timestamp
    );

    /// @notice Emit a seal record. Gas-minimal: event-only, no storage writes.
    /// @param id        Unique message ID (UUID as bytes32)
    /// @param ciphertextHash  SHA-256 of the encrypted ciphertext
    function seal(bytes32 id, bytes32 ciphertextHash) external {
        emit Sealed(id, ciphertextHash, msg.sender, block.timestamp);
    }
}
