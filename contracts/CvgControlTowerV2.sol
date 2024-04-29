// SPDX-License-Identifier: MIT
/**
 _____
/  __ \
| /  \/ ___  _ ____   _____ _ __ __ _  ___ _ __   ___ ___
| |    / _ \| '_ \ \ / / _ \ '__/ _` |/ _ \ '_ \ / __/ _ \
| \__/\ (_) | | | \ V /  __/ | | (_| |  __/ | | | (_|  __/
\____/\___/|_| |_|\_/ \___|_|  \__, |\___|_| |_|\___\___|
                                 __/ |
                                |___/
 */
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";
import "./interfaces/ICvgControlTower.sol";
import "./interfaces/Convex/ICvxStakingPositionService.sol";
import "./interfaces/Convex/ICvxRewardDistributor.sol";
import "./interfaces/Convex/ICvxConvergenceLocker.sol";
import "./interfaces/Convex/ICvxStakingPositionManager.sol";

/// @title Cvg-Finance - CvgControlTowerV2
/// @notice Heart of Convergence V2
/// @dev Acts as a dictionary of addresses for other contracts
contract CvgControlTowerV2 is Ownable2StepUpgradeable {
    /* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=
                  GLOBAL PARAMETERS
    =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-= */

    uint128 public cvgCycle;
    ICvgOracle public cvgOracle;
    ICvg public cvgToken;
    ICvgRewards public cvgRewards;
    address public cloneFactory;

    /* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=
                  BONDS GLOBAL PARAMETERS
    =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-= */

    IBondCalculator public bondCalculator;
    IBondPositionManager public bondPositionManager;
    IBondDepository public bondDepository;

    /// @dev Determines if an address is a bond contract and therefore is able to mint CVG with `mintBond` function.
    mapping(address => bool) public isBond; /// contractAddress => bool

    /* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=
                  STAKING GLOBAL PARAMETERS
    =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-= */
    ISdtStakingPositionManager public sdtStakingPositionManager;
    ISdtStakingPositionService public cvgSdtStaking;
    ISdtBlackHole public sdtBlackHole;
    ISdtBuffer public cvgSdtBuffer;
    IERC20Mintable public cvgSDT;
    IERC20 public sdt;
    address public poolCvgSdt;
    address public sdtFeeCollector;
    address public sdtStakingViewer;
    ISdtStakingPositionService[] public sdAndLpAssetStaking;
    address public sdtRewardDistributor;

    /// @dev Determines if an address is a sdt staking contract and therefore can trigger withdrawals from the SdtBlackHole.
    mapping(address => bool) public isSdtStaking; /// contractAddress => bool

    /**
     * @dev Determines if an address is a staking contract and therefore is able to mint CVG with `mintStaking` function.
     *      Only these addresses can be set up as gauge.
     */
    mapping(address => bool) public isStakingContract; /// contractAddress => bool
    address public sdtUtilities;

    /* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=
                 LOCKING PARAMETERS
    =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-= */
    ILockingPositionManager public lockingPositionManager;
    ILockingPositionService public lockingPositionService;
    ILockingPositionDelegate public lockingPositionDelegate;
    IVotingPowerEscrow public votingPowerEscrow;
    IGaugeController public gaugeController;
    IYsDistributor public ysDistributor;

    /* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=
                 WALLETS
    =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-= */
    address public treasuryPod;
    address public treasuryPdd;
    address public treasuryDao;
    address public treasuryAirdrop;
    address public treasuryTeam;
    address public veSdtMultisig;
    address public treasuryPartners;

    /* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=
                 VESTING
    =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-= */

    IVestingCvg public vestingCvg;
    address public ibo;

    event NewCycle(uint256 cvgCycleId);

    /* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=
                        CONVEX PART  
    =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-= */

    address public cvxConvergenceMultisig;
    ICvxStakingPositionManager public cvxStakingPositionManager;
    ICvxRewardDistributor public cvxRewardDistributor;
    IERC20 public cvx;
    ICvxConvergenceLocker public cvxConvergenceLocker;

    ICvxStakingPositionService[] public cvxAssetStaking;
    ICvxStakingPositionService public cvgCvxStaking;

    function toggleBond(address _bondDepository) external onlyOwner {
        isBond[_bondDepository] = !isBond[_bondDepository];
    }

    /* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=
                      CLONE FACTORY FUNCTIONS
    =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-= */

    /**
     * @notice Toggle a staking contract, can only be called by the owner.
     * @param contractAddress address of the staking contract to toggle
     */
    function toggleStakingContract(address contractAddress) external onlyOwner {
        isStakingContract[contractAddress] = !isStakingContract[contractAddress];
    }

    /**
     * @notice Insert a new sd/LP-asset staking contract, can only be called by the clone factory.
     * @param _sdtStakingClone address of the new staking contract
     */
    function insertNewSdtStaking(ISdtStakingPositionService _sdtStakingClone) external {
        require(msg.sender == cloneFactory, "CLONE_FACTORY");
        sdAndLpAssetStaking.push(_sdtStakingClone);
        isSdtStaking[address(_sdtStakingClone)] = true;
        isStakingContract[address(_sdtStakingClone)] = true;
    }

    /* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=
                      STAKING GETTERS
    =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-= */

    struct Staking {
        address stakingContract;
        string stakingName;
    }

    /**
     * @notice Get sdt staking contracts with pagination.
     * @param _cursorStart cursor position (starting position)
     * @param _lengthDesired desired length of array
     * @return array of sdt staking contracts with related global data
     */
    function getSdtStakings(uint256 _cursorStart, uint256 _lengthDesired) external view returns (Staking[] memory) {
        uint256 _totalArrayLength = sdAndLpAssetStaking.length;

        if (_cursorStart + _lengthDesired > _totalArrayLength) {
            _lengthDesired = _totalArrayLength - _cursorStart;
        }
        /// @dev Prevent to reach an index that doesn't exist in the array
        Staking[] memory array = new Staking[](_lengthDesired);
        for (uint256 i = _cursorStart; i < _cursorStart + _lengthDesired; ) {
            ISdtStakingPositionService sdtStakingService = sdAndLpAssetStaking[i];
            array[i - _cursorStart] = Staking({
                stakingContract: address(sdtStakingService),
                stakingName: sdtStakingService.stakingAsset().name()
            });
            unchecked {
                ++i;
            }
        }

        return array;
    }

    /**
     * @notice Get cvx staking contracts with pagination.
     * @param _cursorStart cursor position (starting position)
     * @param _lengthDesired desired length of array
     * @return array of cvx staking contracts with related global data
     */
    function getCvxStakings(uint256 _cursorStart, uint256 _lengthDesired) external view returns (Staking[] memory) {
        uint256 _totalArrayLength = cvxAssetStaking.length;

        if (_cursorStart + _lengthDesired > _totalArrayLength) {
            _lengthDesired = _totalArrayLength - _cursorStart;
        }

        /// @dev Prevent to reach an index that doesn't exist in the array
        Staking[] memory array = new Staking[](_lengthDesired);
        for (uint256 i = _cursorStart; i < _cursorStart + _lengthDesired; ) {
            ICvxStakingPositionService cvxStakingService = cvxAssetStaking[i];
            array[i - _cursorStart] = Staking({
                stakingContract: address(cvxStakingService),
                stakingName: cvxStakingService.stakingAsset().name()
            });

            unchecked {
                ++i;
            }
        }

        return array;
    }

    /* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=
                          SETTERS
    =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-= */
    function setOracle(ICvgOracle newCvgOracle) external onlyOwner {
        cvgOracle = newCvgOracle;
    }

    function setTreasuryPod(address newTreasuryPodMultisig) external onlyOwner {
        treasuryPod = newTreasuryPodMultisig;
    }

    function setTreasuryPdd(address newTreasuryPddMultisig) external onlyOwner {
        treasuryPdd = newTreasuryPddMultisig;
    }

    function setTreasuryDao(address newTreasuryDao) external onlyOwner {
        treasuryDao = newTreasuryDao;
    }

    function setTreasuryAirdrop(address newTreasuryAirdrop) external onlyOwner {
        treasuryAirdrop = newTreasuryAirdrop;
    }

    function setTreasuryTeam(address newTreasuryTeam) external onlyOwner {
        treasuryTeam = newTreasuryTeam;
    }

    function setTreasuryPartners(address newtreasuryPartners) external onlyOwner {
        treasuryPartners = newtreasuryPartners;
    }

    function setBondDepository(IBondDepository newBondDepository) external onlyOwner {
        bondDepository = newBondDepository;
    }

    function setBondCalculator(IBondCalculator newBondCalculator) external onlyOwner {
        bondCalculator = newBondCalculator;
    }

    function setCvgRewards(ICvgRewards newCvgRewards) external onlyOwner {
        cvgRewards = newCvgRewards;
    }

    function setVeCVG(IVotingPowerEscrow newVotingPowerEscrow) external onlyOwner {
        votingPowerEscrow = newVotingPowerEscrow;
    }

    function setGaugeController(IGaugeController newGaugeController) external onlyOwner {
        gaugeController = newGaugeController;
    }

    function setCloneFactory(address newCloneFactory) external onlyOwner {
        cloneFactory = newCloneFactory;
    }

    function setLockingPositionManager(ILockingPositionManager newLockingPositionManager) external onlyOwner {
        lockingPositionManager = newLockingPositionManager;
    }

    function setLockingPositionService(ILockingPositionService newLockingPositionService) external onlyOwner {
        lockingPositionService = newLockingPositionService;
    }

    function setLockingPositionDelegate(ILockingPositionDelegate newLockingPositionDelegate) external onlyOwner {
        lockingPositionDelegate = newLockingPositionDelegate;
    }

    function setYsDistributor(IYsDistributor _ysDistributor) external onlyOwner {
        ysDistributor = _ysDistributor;
    }

    function setCvg(ICvg _cvgToken) external onlyOwner {
        cvgToken = _cvgToken;
    }

    function setBondPositionManager(IBondPositionManager _bondPositionManager) external onlyOwner {
        bondPositionManager = _bondPositionManager;
    }

    function setVestingCvg(IVestingCvg _vestingCvg) external onlyOwner {
        vestingCvg = _vestingCvg;
    }

    function setIbo(address _ibo) external onlyOwner {
        ibo = _ibo;
    }

    /* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=
                        STAKE DAO 
    =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-= */

    function setSdtStakingPositionManager(ISdtStakingPositionManager _sdtStakingPositionManager) external onlyOwner {
        sdtStakingPositionManager = _sdtStakingPositionManager;
    }

    function setSdtStakingViewer(address _sdtStakingViewer) external onlyOwner {
        sdtStakingViewer = _sdtStakingViewer;
    }

    function setSdt(IERC20 _sdt) external onlyOwner {
        sdt = _sdt;
    }

    function setCvgSdt(IERC20Mintable _cvgSDT) external onlyOwner {
        cvgSDT = _cvgSDT;
    }

    function setCvgSdtStaking(ISdtStakingPositionService _cvgSdtStaking) external onlyOwner {
        cvgSdtStaking = _cvgSdtStaking;
    }

    function setVeSdtMultisig(address _veSdtMultisig) external onlyOwner {
        veSdtMultisig = _veSdtMultisig;
    }

    function setCvgSdtBuffer(ISdtBuffer _cvgSdtBuffer) external onlyOwner {
        cvgSdtBuffer = _cvgSdtBuffer;
    }

    function setPoolCvgSdt(address _poolCvgSDT) external onlyOwner {
        poolCvgSdt = _poolCvgSDT;
    }

    function setSdtBlackHole(ISdtBlackHole _sdtBlackHole) external onlyOwner {
        sdtBlackHole = _sdtBlackHole;
    }

    function setSdtFeeCollector(address _sdtFeeCollector) external onlyOwner {
        sdtFeeCollector = _sdtFeeCollector;
    }

    function setSdtUtilities(address _sdtUtilities) external onlyOwner {
        sdtUtilities = _sdtUtilities;
    }

    function setSdtRewardDistributor(address _sdtRewardDistributor) external onlyOwner {
        sdtRewardDistributor = _sdtRewardDistributor;
    }

    /* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=
                        CONVEX
    =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-= */
    function setCvxConvergenceMultisig(address _cvxConvergenceMultisig) external onlyOwner {
        cvxConvergenceMultisig = _cvxConvergenceMultisig;
    }

    function setCvxStakingPositionManager(ICvxStakingPositionManager _cvxStakingPositionManager) external onlyOwner {
        cvxStakingPositionManager = _cvxStakingPositionManager;
    }

    function setCvx(IERC20 _cvx) external onlyOwner {
        cvx = _cvx;
    }

    function setCvxConvergenceLocker(ICvxConvergenceLocker _cvxConvergenceLocker) external onlyOwner {
        cvxConvergenceLocker = _cvxConvergenceLocker;
    }

    function setCvgCvxStaking(ICvxStakingPositionService _cvgCvxStaking) external onlyOwner {
        cvgCvxStaking = _cvgCvxStaking;
    }

    function setCvxRewardDistributor(ICvxRewardDistributor _cvxRewardDistributor) external onlyOwner {
        cvxRewardDistributor = _cvxRewardDistributor;
    }

    /* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=
                      CYCLE MANAGEMENT
    =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-= */

    /**
     * @notice Update Cvg cycle.
     * @dev Updates ysCvg total supply too, can only be called by CvgRewards.
     */
    function updateCvgCycle() external {
        require(msg.sender == address(cvgRewards), "NOT_CVG_REWARDS");
        emit NewCycle(++cvgCycle);
    }
}
