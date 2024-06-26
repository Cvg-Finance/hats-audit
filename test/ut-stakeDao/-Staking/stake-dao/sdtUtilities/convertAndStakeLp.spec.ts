import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";
import {Signer, EventLog} from "ethers";
import {ethers} from "hardhat";
import {
    ERC20,
    SdtStakingPositionService,
    ISdAssetGauge,
    SdtUtilities,
    CloneFactory,
    ILpStakeDaoStrat,
    SdtBlackHole,
    SdtStakingPositionManager,
} from "../../../../../typechain-types";
import {IContractsUser, IUsers} from "../../../../../utils/contractInterface";
import {deploySdtStakingFixture} from "../../../../fixtures/stake-dao";
import {CYCLE_2, ONE_ETHER, ONE_HUNDRED_ETHER, TEN_ETHER, TOKEN_4, TOKEN_5, TOKEN_6, TWO_ETHER, TWO_MILLION_ETHER} from "../../../../../resources/constant";
import {GaugeController} from "../../../../../typechain-types-vyper/GaugeController";
import {expect} from "chai";
import {TOKEN_ADDR_triLLAMA_STRAT} from "../../../../../resources/tokens/stake-dao";

describe("SdtUtilities - Convert & stake LP Asset", () => {
    let contractsUsers: IContractsUser, users: IUsers;
    let user1: Signer, treasuryDao: Signer;

    let gaugeController: GaugeController, cloneFactory: CloneFactory;
    let triLLAMA: ERC20,
        triLLAMAStrat: ILpStakeDaoStrat,
        triLLAMAGauge: ISdAssetGauge,
        sdtBlackhole: SdtBlackHole,
        stakingPositionManager: SdtStakingPositionManager;
    let sdtUtilities: SdtUtilities;
    let sdTriCryptoGaugeStaking: SdtStakingPositionService;

    before(async () => {
        contractsUsers = await loadFixture(deploySdtStakingFixture);
        const tokens = contractsUsers.contracts.tokens;
        const tokensStakeDao = contractsUsers.contracts.tokensStakeDao;

        users = contractsUsers.users;
        user1 = users.user1;
        treasuryDao = users.treasuryDao;
        sdtUtilities = contractsUsers.contracts.stakeDao.sdtUtilities;

        gaugeController = contractsUsers.contracts.locking.gaugeController;

        cloneFactory = contractsUsers.contracts.base.cloneFactory;
        sdtBlackhole = contractsUsers.contracts.stakeDao.sdtBlackHole;

        stakingPositionManager = contractsUsers.contracts.stakeDao.sdtStakingPositionManager;

        triLLAMA = tokensStakeDao.triLLAMA;
        triLLAMAStrat = await ethers.getContractAt("ILpStakeDaoStrat", TOKEN_ADDR_triLLAMA_STRAT);
        triLLAMAGauge = tokensStakeDao.triLLAMAGauge;
    });

    it("Success : Get Gauge token through Strategy", async () => {
        await triLLAMA.connect(user1).approve(triLLAMAStrat, ethers.MaxUint256);
        await triLLAMAStrat.connect(user1).deposit(user1, TWO_MILLION_ETHER, true);
    });

    it("Success : Create Staking contract", async () => {
        const createTx = await cloneFactory.connect(users.treasuryDao).createSdtStakingAndBuffer(triLLAMAGauge, "CVG_LAMA", true);

        const receipt1 = await createTx.wait();
        const logs = receipt1?.logs as EventLog[];
        const events1 = logs.filter((e) => e.fragment && e.fragment.name === "SdtStakingCreated");
        const args = events1[0].args;

        sdTriCryptoGaugeStaking = await ethers.getContractAt("SdtStakingPositionService", args.stakingClone);

        await gaugeController.connect(users.treasuryDao).add_gauge(sdTriCryptoGaugeStaking, 0, 0);
    });
    it("Fail : set stable pool with random user", async () => {
        const setStablePools: SdtUtilities.SetStablePoolStruct[] = [{liquidLocker: triLLAMAGauge, lp: triLLAMAGauge}];
        await sdtUtilities.connect(user1).setStablePools(setStablePools).should.be.revertedWith("Ownable: caller is not the owner");
    });
    it("Fail : Approve tokens with random user", async () => {
        await sdtUtilities
            .connect(user1)
            .approveTokens([
                {token: triLLAMAGauge, spender: sdTriCryptoGaugeStaking, amount: ethers.MaxUint256},
                {token: triLLAMA, spender: triLLAMAGauge, amount: ethers.MaxUint256},
                {token: triLLAMA, spender: triLLAMAStrat, amount: ethers.MaxUint256},
            ])
            .should.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Success : Approve tokens", async () => {
        await sdtUtilities.approveTokens([
            {token: triLLAMAGauge, spender: sdTriCryptoGaugeStaking, amount: ethers.MaxUint256},
            {token: triLLAMA, spender: triLLAMAGauge, amount: ethers.MaxUint256},
            {token: triLLAMA, spender: triLLAMAStrat, amount: ethers.MaxUint256},
        ]);

        await triLLAMAGauge.connect(user1).approve(sdtUtilities, ethers.MaxUint256);
        await triLLAMA.connect(user1).approve(sdtUtilities, ethers.MaxUint256);
    });

    it("Success : Create position X/X", async () => {
        let balanceDelta = await triLLAMAGauge.balanceOf(sdtBlackhole);
        const tx = sdtUtilities.connect(user1).convertAndStakeLpAsset(0, sdTriCryptoGaugeStaking, ONE_ETHER, TWO_ETHER, true);
        await expect(tx).to.changeTokenBalances(triLLAMA, [user1], [-TWO_ETHER]);
        balanceDelta = (await triLLAMAGauge.balanceOf(sdtBlackhole)) - balanceDelta;
        expect(balanceDelta).to.be.gte(ONE_ETHER + TWO_ETHER);
        await expect(tx).to.changeTokenBalances(triLLAMAGauge, [user1, sdtBlackhole], [-ONE_ETHER, balanceDelta]);

        expect(await sdTriCryptoGaugeStaking.tokenInfoByCycle(CYCLE_2, TOKEN_4)).to.deep.eq([balanceDelta, balanceDelta]);
        expect(await stakingPositionManager.ownerOf(TOKEN_4)).to.be.eq(await user1.getAddress());
    });

    it("Success : Create position 0/X", async () => {
        let balanceDelta = await triLLAMAGauge.balanceOf(sdtBlackhole);

        const tx = await sdtUtilities.connect(user1).convertAndStakeLpAsset(0, sdTriCryptoGaugeStaking, 0, ONE_HUNDRED_ETHER, false);
        await expect(tx).to.changeTokenBalances(triLLAMA, [user1], [-ONE_HUNDRED_ETHER]);
        balanceDelta = (await triLLAMAGauge.balanceOf(sdtBlackhole)) - balanceDelta;
        expect(balanceDelta).to.be.within((ONE_HUNDRED_ETHER * 999n) / 1000n, (ONE_HUNDRED_ETHER * 1001n) / 1000n);
        await expect(tx).to.changeTokenBalances(triLLAMAGauge, [sdtBlackhole], [balanceDelta]);

        expect(await sdTriCryptoGaugeStaking.tokenInfoByCycle(CYCLE_2, TOKEN_5)).to.deep.eq([balanceDelta, balanceDelta]);
        expect(await stakingPositionManager.ownerOf(TOKEN_5)).to.be.eq(await user1.getAddress());
    });

    it("Success : Create position X/0", async () => {
        const tx = await sdtUtilities.connect(user1).convertAndStakeLpAsset(0, sdTriCryptoGaugeStaking, TEN_ETHER, 0, false);
        await expect(tx).to.changeTokenBalances(triLLAMA, [user1], [0]);
        await expect(tx).to.changeTokenBalances(triLLAMAGauge, [user1, sdtBlackhole], [-TEN_ETHER, TEN_ETHER]);

        expect(await sdTriCryptoGaugeStaking.tokenInfoByCycle(CYCLE_2, TOKEN_6)).to.deep.eq([TEN_ETHER, TEN_ETHER]);
        expect(await stakingPositionManager.ownerOf(TOKEN_6)).to.be.eq(await user1.getAddress());
    });
});
