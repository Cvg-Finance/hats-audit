// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "../ICommonStruct.sol";
import "../ISdtBuffer.sol";

interface ICvxStakingPositionService {
    struct CycleInfo {
        uint256 cvgRewardsAmount;
        uint256 totalStaked;
        bool isCvxProcessed;
    }

    struct TokenInfo {
        uint256 amountStaked;
        uint256 pendingStaked;
    }
    struct CycleInfoMultiple {
        uint256 totalStaked;
        ICommonStruct.TokenAmount[] cvxClaimable;
    }
    struct StakingInfo {
        uint256 tokenId;
        string symbol;
        uint256 pending;
        uint256 totalStaked;
        uint256 cvgClaimable;
        ICommonStruct.TokenAmount[] cvxClaimable;
    }

    function setBuffer(address _buffer) external;

    function symbol() external view returns (string memory);

    function stakingCycle() external view returns (uint256);

    function cycleInfo(uint256 cycleId) external view returns (CycleInfo memory);

    function stakingAsset() external view returns (ISdAssetGauge);

    function buffer() external view returns (ISdtBuffer);

    function tokenTotalStaked(uint256 _tokenId) external view returns (uint256 amount);

    function stakedAmountEligibleAtCycle(
        uint256 cvgCycle,
        uint256 tokenId,
        uint256 actualCycle
    ) external view returns (uint256);

    function tokenInfoByCycle(uint256 cycleId, uint256 tokenId) external view returns (TokenInfo memory);

    function stakingInfo(uint256 tokenId) external view returns (StakingInfo memory);

    function getProcessedCvxRewards(uint256 _cycleId) external view returns (ICommonStruct.TokenAmount[] memory);

    function deposit(uint256 tokenId, uint256 amount, address operator) external;

    function claimCvgCvxMultiple(
        uint256 _tokenId,
        address operator
    ) external returns (uint256, ICommonStruct.TokenAmount[] memory);
}
