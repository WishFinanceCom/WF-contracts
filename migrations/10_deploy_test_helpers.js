var FakeCoin = artifacts.require("./FakeCoin.sol");
var FakeCoin2 = artifacts.require("./FakeCoin2.sol");
var FakeCoin3 = artifacts.require("./FakeCoin3.sol");
var Stub = artifacts.require("./helpers/Stub.sol");
var Clock = artifacts.require("./Clock.sol");
var WFPlatformTestable = artifacts.require("./WFPlatformTestable.sol");
//var KrakenPriceTicker = artifacts.require("./KrakenPriceTicker.sol");

module.exports = function(deployer,network) {
  if(network === 'development' || network === 'test') {
      deployer.deploy(Stub)
        .then(() => deployer.deploy(WFPlatformTestable))
        .then(() => deployer.deploy(FakeCoin))
        .then(() => deployer.deploy(FakeCoin2))
        .then(() => deployer.deploy(FakeCoin3))
        .then(() => deployer.deploy(Clock))
//        .then(() => deployer.deploy(KrakenPriceTicker, true))
        .then(() => console.log("[MIGRATION] [10] Deploy Test contracts: #done"))
    }
}
