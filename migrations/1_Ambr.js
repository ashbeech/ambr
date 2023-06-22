const Ambr = artifacts.require("Ambr");

module.exports = async function (deployer) {
  await deployer.deploy(
    Ambr,
    "Ambr", // <-- Ambr name
    "AMBR", // <-- Asset symbol
    "0x5B3e180e42b5E702C5A090A79D6B05152d4fd2a2" // <-- this is address to be admin/contract owner
  );
  let assetInstance = await Asset.deployed();
  let uri = await assetInstance.getContractURI();
  console.log("Deployed Contract URI: ", uri);
};
