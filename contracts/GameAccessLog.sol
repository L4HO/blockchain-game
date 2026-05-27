// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title GameAccessLog
/// @notice Records mobile-ID-based access approvals and game play results.
/// @dev Store only hashes or opaque IDs. Do not put resident registration numbers,
/// names, phone numbers, birth dates, or raw mobile ID credentials on-chain.
contract GameAccessLog {
    struct AccessRecord {
        address player;
        bytes32 mobileIdHash;
        uint64 issuedAt;
        bool active;
    }

    struct PlayRecord {
        address player;
        bytes32 sessionId;
        bytes32 gameId;
        uint256 score;
        uint64 playedAt;
    }

    address public owner;
    mapping(address => bool) public operators;
    mapping(address => AccessRecord) private accessRecords;
    mapping(bytes32 => PlayRecord) private playRecords;

    event OperatorUpdated(address indexed operator, bool allowed);
    event AccessGranted(address indexed player, bytes32 indexed mobileIdHash, uint64 issuedAt);
    event AccessRevoked(address indexed player);
    event GamePlayed(
        address indexed player,
        bytes32 indexed sessionId,
        bytes32 indexed gameId,
        uint256 score,
        uint64 playedAt
    );

    error NotOwner();
    error NotOperator();
    error InvalidPlayer();
    error AccessRequired();
    error DuplicateSession();

    constructor() {
        owner = msg.sender;
        operators[msg.sender] = true;
        emit OperatorUpdated(msg.sender, true);
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyOperator() {
        if (!operators[msg.sender]) revert NotOperator();
        _;
    }

    function setOperator(address operator, bool allowed) external onlyOwner {
        operators[operator] = allowed;
        emit OperatorUpdated(operator, allowed);
    }

    function grantAccess(address player, bytes32 mobileIdHash, uint64 issuedAt) external onlyOperator {
        if (player == address(0)) revert InvalidPlayer();

        accessRecords[player] = AccessRecord({
            player: player,
            mobileIdHash: mobileIdHash,
            issuedAt: issuedAt,
            active: true
        });

        emit AccessGranted(player, mobileIdHash, issuedAt);
    }

    function revokeAccess(address player) external onlyOperator {
        accessRecords[player].active = false;
        emit AccessRevoked(player);
    }

    function recordGame(
        address player,
        bytes32 sessionId,
        bytes32 gameId,
        uint256 score,
        uint64 playedAt
    ) external onlyOperator {
        if (!accessRecords[player].active) revert AccessRequired();
        if (playRecords[sessionId].player != address(0)) revert DuplicateSession();

        playRecords[sessionId] = PlayRecord({
            player: player,
            sessionId: sessionId,
            gameId: gameId,
            score: score,
            playedAt: playedAt
        });

        emit GamePlayed(player, sessionId, gameId, score, playedAt);
    }

    function getAccess(address player) external view returns (AccessRecord memory) {
        return accessRecords[player];
    }

    function getPlay(bytes32 sessionId) external view returns (PlayRecord memory) {
        return playRecords[sessionId];
    }
}
