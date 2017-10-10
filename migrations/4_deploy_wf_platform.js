var WFPlatform = artifacts.require("./WFPlatform.sol");
const MultiEventsHistory = artifacts.require("./MultiEventsHistory.sol");

module.exports = function(deployer,network) {
      deployer.deploy(WFPlatform)
          .then(() => MultiEventsHistory.deployed())
          .then(_history => history = _history )
          .then(() => WFPlatform.deployed())
          .then(_platform => platform = _platform)
          .then(() => history.authorize(platform.address))
          .then(() => platform.setupEventsHistory(history.address))
          .then(() => console.log("[MIGRATION] [4] WFPlatform: #done"))
}
