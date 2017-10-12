const WFAssetProxy = artifacts.require("./WFAssetProxy.sol");
const WFPlatform = artifacts.require("./WFPlatform.sol");
const WF = artifacts.require("./WF.sol");

module.exports = function(deployer,network) {
    const WF_SYMBOL = 'WF';
    const WF_NAME = 'Wish Finance Crypto Token';
    const WF_DESCRIPTION = 'WF wishfinance.com asset';

    const BASE_UNIT = 8;
    const IS_REISSUABLE = true;
    const IS_NOT_REISSUABLE = false;

    const VALUE = 10000; //should be changed to final ICO value before migration to mainnet

    const ICO_USD = 10; //should be changed to final ICO value before migration to mainnet
    const ICO_ETH = 10; //should be changed to final ICO value before migration to mainnet
    const ICO_BTC = 10; //should be changed to final ICO value before migration to mainnet
    const ICO_LTC = 10; //should be changed to final ICO value before migration to mainnet

    deployer
      .then(() => WFPlatform.deployed())
      .then(_platform => platform = _platform)
      .then(() => platform.issueAsset(WF_SYMBOL, VALUE, WF_NAME, WF_DESCRIPTION, BASE_UNIT, IS_NOT_REISSUABLE))
      .then(() => deployer.deploy(WFAssetProxy))
      .then(() => WFAssetProxy.deployed())
      .then(_proxy => platform.setProxy(_proxy.address,WF_SYMBOL))
      .then(() => WFAssetProxy.deployed())
      .then(_proxy => _proxy.init(WFPlatform.address, WF_SYMBOL, WF_NAME))
      .then(() => deployer.deploy(WF))
      .then(() => WF.deployed())
      .then(_asset => _asset.initWF(WFAssetProxy.address,ICO_USD,ICO_ETH,ICO_BTC,ICO_LTC))
      .then(() => WFAssetProxy.deployed())
      .then(_proxy => _proxy.proposeUpgrade(WF.address))
      .then(() => console.log("[MIGRATION] [5] WF ASSET: #done"))
}
