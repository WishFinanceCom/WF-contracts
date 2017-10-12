const Lock6m = artifacts.require("./Lockup6m.sol");
const WFAssetProxy = artifacts.require("./WFAssetProxy.sol");
const MultiEventsHistory = artifacts.require("./MultiEventsHistory.sol");

module.exports = function(deployer,network) {
      deployer.deploy(Lock6m,WFAssetProxy.address)
          .then(() => MultiEventsHistory.deployed())
          .then(_history => history = _history )
          .then(() => Lock6m.deployed())
          .then(_timeLock => timeLock = _timeLock)
          .then(() => history.authorize(timeLock.address))
          .then(() => timeLock.setupEventsHistory(history.address))
          .then(() => console.log("[MIGRATION] [7] Time Lock: #done"))
}
