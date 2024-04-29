import {getContract} from "./deployer/complete/helper";
import {BOND_DEPOSITORY_CONTRACT} from "../resources/contracts";
import {BondDepository} from "../typechain-types";
async function main() {
    const data =
        "0xf8655be1000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000000000000000000000000000000f939e0a03fb07f59a73314e73794be0e57ac1b4e000000000000000000000000000000000000000000000000000000000003d0900000000000000000000000000000000000000000000000000000000000278d00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000013880000000000000000000000000000000000000000000000000000000000009c400000000000000000000000000000000000000000000000000000000000015f9000000000000000000000000000000000000000000000000000000000000000fa00000000000000000000000000000000000000000000000000000000001275000000000000000000000000000000000000000000000007695a92c20d6fe00000000000000000000000000000000000000000000000000000000000006602e9f80000000000000000000000000000000000000000000000000000000000000000000000000000000000000000f939e0a03fb07f59a73314e73794be0e57ac1b4e000000000000000000000000000000000000000000000000000000000003d0900000000000000000000000000000000000000000000000000000000000278d000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000138800000000000000000000000000000000000000000000000000000000000124f8000000000000000000000000000000000000000000000000000000000001e84800000000000000000000000000000000000000000000000000000000000000fa00000000000000000000000000000000000000000000000000000000001baf800000000000000000000000000000000000000000000007695a92c20d6fe00000000000000000000000000000000000000000000000000000000000006602e9f800000000000000000000000000000000000000000000000000000000000000000000000000000000000000004e3fbd56cd56c3e72c1403e103b45db9da5b9d2b000000000000000000000000000000000000000000000000000000000003d0900000000000000000000000000000000000000000000000000000000000278d000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000138800000000000000000000000000000000000000000000000000000000000124f8000000000000000000000000000000000000000000000000000000000001e84800000000000000000000000000000000000000000000000000000000000000fa00000000000000000000000000000000000000000000000000000000001baf8000000000000000000000000000000000000000000000065a4da25d3016c00000000000000000000000000000000000000000000000000000000000006602e9f8";
    const bondDepository = await getContract<BondDepository>(BOND_DEPOSITORY_CONTRACT);
    const decoded = bondDepository.interface.parseTransaction({data});
    console.log(decoded);
    console.log(decoded?.args);
}

main();

//ts-node scripts/decodeData.ts