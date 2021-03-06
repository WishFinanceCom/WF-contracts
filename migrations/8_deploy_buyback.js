const BuyBack = artifacts.require("./BuyBack.sol");
const WFAssetProxy = artifacts.require("./WFAssetProxy.sol");
const MultiEventsHistory = artifacts.require("./MultiEventsHistory.sol");
const DelayedPayments = artifacts.require("./DelayedPayments.sol");

module.exports = function(deployer,network) {
      deployer.deploy(BuyBack,DelayedPayments.address)
          .then(() => MultiEventsHistory.deployed())
          .then(_history => history = _history )
          .then(() => BuyBack.deployed())
          .then(_buyBack => buyBack = _buyBack)
          .then(() => history.authorize(buyBack.address))
          .then(() => buyBack.setupEventsHistory(history.address))
          .then(() => DelayedPayments.deployed())
          .then(_delayedPayments => _delayedPayments.authorizeSpender(buyBack.address,true))
          .then(() => console.log("[MIGRATION] [8] BuyBack: #done"))
}
