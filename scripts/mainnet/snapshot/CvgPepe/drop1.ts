//117 first holder/burner - 1000 CVG for each pepe holded/burned AT LAUNCH  - 03/02/2024 -  0xd07db2054c6c6d612040ea25b43b51828fee236baf76c435d7c3bc114d223564
const addresses = [
    "0xDFcf63F571f889b6c71272A793F7B94246ca2D9B",
    "0xC4de88d57fB4E50dD135b96d9b2eFE87f8f76aeD",
    "0x75E70dB620d5491f69526E22355236f65B46834E",
    "0x3723316279D86CFA3e3B0B32EA55B8eD0139468e",
    "0xD64E4A04Ca168d7EBaB84Be43F48B0BaE01c2d68",
    "0xACAb290cfF88d2cB274609d06BD1198533494F02",
    "0x84195879d3117089e2d28a3192847cf0EA4FF6b8",
    "0x908b770a12816b29796B1635bD2b5Cc50E30982f",
    "0xF18C111a6Fe63E63dF8A1dff05F5140A6748658d",
    "0x7c867E29C9A30409Cb1F556486C06e94D33FDB8C",
    "0xdb3B2d1B37985fbfB28298106d6721cAd2211146",
    "0x716eC36Be0dd20a5c22455Cb37D4Ca86Ae134EBe",
    "0xCD16e7FdfA44eF400f03cfbeE28eC8A32d6626e0",
    "0x868feE8Bf1dc8FE3e8aAC07051eFeBa6AB2B87bC",
    "0x7BFEe91193d9Df2Ac0bFe90191D40F23c773C060",
    "0x357A15f1D5feFF777fB38Ec5424cC2605C091fb8",
    "0x510c0fcBD5FE56af9F5b23F7b7c4Ad0bFF2b5B00",
    "0x6E1aD8E91B9b7B677C2a81FA31B6FaAA657424Fb",
    "0xC445C2a7aeE2613D865Cd53AB545f6Bcc54a1fc9",
    "0xCF23FbbbC532e49815f2C2855A8f72051F578B64",
    "0xb1ca00e303E9B282E544D3c023D575650d091Cf4",
    "0x2327C8a6e0D3cef11dB85907cB041563e39e97aC",
    "0x441702E94AEfE39CF4E1738806E3bab36e3A51E2",
    "0x86a33FE626BDc5642Dc6f7D52a0911342F5dC987",
    "0x822ac5BeE1A0f8aE59126BB37187e5D3F5f5Ea32",
    "0x383E931Ae69aCCED940e0301D5BD68F43FB3556E",
    "0xd8A7A2b86F5FE23eCBaceB3F807B8ff033136a53",
    "0x4f0Fa4fFB07BF342Fa62A83204186fBEd7082a37",
    "0x45F00a71aD07F32a785cca0c0C11486063Ea874d",
    "0x6B8Ee579F5A8C8c67ab04d5A09768ca7EFFf9Ae8",
    "0x2d101a85479A6F2066C008bD7681780FFF546ADb",
    "0x525A5942d203D5d96882297Dc7488b9206DcB2d0",
    "0x213626174Ab7C47d08528eCfa5cab04712894405",
    "0x33f05138b41f432cfc0849abacB1BeE813EC5888",
    "0xCF1D9173BF69C795DD9acaF57F4976c3B3cb6Db4",
    "0x1AFe8A03214Bf47300c2b3B7918ffDa98Fb359C8",
    "0xaA90beFC76B37F487eEc5C1A593ea5b9826440bE",
    "0x5CB75586dCcF35a30A65cc9A78C59f15fFe85b4C",
    "0xbAd7Bc69E0b727bD771dA4B111f5D065f57b36E6",
    "0xE5A6d4a0DC0C0923204A917278F777bd18b9b23F",
    "0x854ce16536CC41A0593A754F88a3eAf14EEe9938",
    "0x55c20F32ca8b0CFcC6b493acAc4E9d5700409990",
    "0xF29a53cCA8Be4cCC45a5406a62107BF40ABeEA4E",
    "0x1343105512a338ED82BA9711EF7B3A875fd69720",
    "0x9d36e860BD6fc2ba04cb22D6e92Ea6828989Dc40",
    "0x605b3a9CeAaBa25448E7838AdFD52CE16a0761BF",
    "0x61ABf360FEe2b472b8E6dCD94215120259A95Dd7",
    "0xE2F28f1b861a5F633af1084A0dcc2916D4471605",
    "0x69d08A457b0ff73291e0cb741cb863825561F616",
    "0x65a6c998175AFAD3DD179a535cf5f76f4bb374f5",
    "0x1a5C09Ed829bDcb10015b9141fFb6656f8A4EF7D",
    "0x205e5e44df5a1A331c25752C39644976D0589fD6",
    "0xdA9F2C13a92eC8FA05eA5A2aAA13a82ae56c8C01",
    "0x9A062a10a6C4C60f0a7265204bD79B2f1183f1A3",
    "0x090665CA051a4540709A86384e941b5b3031B2af",
    "0x12623e82cFC3d54365Af2d4ccA915E49e03d1B56",
    "0xbba2379F5cc9A2f248C5Cf18aD72379AE2478F42",
    "0x2d16BF6C8BAd562Cb1b3CBd87eA7913993CD8E39",
    "0xe4aD7226D41ba58D20322FC121b9C509B5f07E2C",
    "0x71c2cF4877c991f5B7047636C8ebc04408a8312d",
    "0x0312F2D46239A879A2219Cb003C996aEAC71b8b8",
    "0x88F3FF0120ECAA2E0b4a9e37729D9EEcE8BEaDB2",
    "0x02f3d3912F8Bd97c4791970aa4cf96DeDD05772c",
    "0x7fFd6CDe0d4490533E6B36B032f84D3ea3f71076",
    "0x37D34B424dC624a41fE412ab1460d1e0eBEfb8aF",
    "0xc6c379c92dC947f82289f15b2A16587DD969c490",
    "0xBBA6F25C710e688E78048f18D5606199b1d5f164",
    "0x7d81b9f16D10440DB9C2F1e8b32DfF9B56CF05d1",
    "0xBF153f52ebE2E99332e94c3dc15F8038cD654b64",
    "0xEB9e4699f50C3B99453b1DCe01DA6D4cef66d684",
    "0xda5930dc7C0022ecf9A084120dF232c24E54ddAB",
    "0xE3c38D7895EEd1f3e6ac6c9ce7899710C77e6Fe5",
    "0xc30e2cb067855e1Df84f1B50E9784B4426486617",
    "0xcF24f9DB11D7cf69b1f6f438c1A5b576456F6df2",
    "0x8e5FC06db810a6597DA3337F7aBFD451aCFD45ac",
    "0x42aaBD3A2f2b64A44B99e0ab025657ba73B871a2",
    "0x6392AFADACDA344531FE881d5Da22bF0f0ab83Bd",
    "0x8A3418e43aC6876F62B21224B3017ccc4604d3B3",
    "0x6094D9fAa6806e005B001C6c5D0C9c7D3d708a1F",
    "0x09bCE8BFD6494AA41F99E3c0Ee29a4d6482abB7b",
    "0x3d19997b37eABDE5b5db2374587971712e70eC13",
    "0xEdb7CF556F295998252DCc159A725061b55D792b",
    "0x02f62508C4A535444a19C13Ab7Ce6b8b3c91231D",
    "0xFAb308F1b42434e6e1A1Fa4B1F9406a11160337f",
];
const values = [
    "1000000000000000000000",
    "1000000000000000000000",
    "5000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "24000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "2000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "4000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "2000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
    "1000000000000000000000",
];
const total = "117000000000000000000000";
