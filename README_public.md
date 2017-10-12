# WF Platform SmartContracts

WF, BayBack and time-lock/vesting contracts.

- WFPlatform.sol acts as a base for all tokens operation (like issuing, balance storage, transfer).
- WFAsset.sol adds interface layout (described in BMCAssetInterface.sol)
- WFAssetWithFee.sol extends BMCAsset.sol with operations fees logic.
- WFAssetProxy.sol acts as a transaction proxy, provide an ERC20 interface (described in ERC20Interface.sol) and allows additional logic insertions and wallet access recovery in case of key loss.
- WFPlatformEmitter.sol provides platform events definition.

To understand contract logic better you can take a look at the comments also as at unit tests

## Testing

NodeJS 6+ required.
```bash
npm install -g ethereumjs-testrpc
npm install -g truffle
```

Then start TestRPC in a separate terminal by doing
```bash
testrpc -g 1
```

Then run tests in a project dir by doing
```bash
truffle compile
truffle test
```
