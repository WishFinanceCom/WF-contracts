var bmcPlatformTestable = artifacts.require("./WFPlatformTestable.sol");
var bmc = artifacts.require("./WF.sol");
var bmcAssetProxy = artifacts.require("./WFAssetProxy.sol");
var Stub = artifacts.require("./Stub.sol");
var Reverter = require('./helpers/reverter');
var bytes32 = require('./helpers/bytes32');
var eventsHelper = require('./helpers/eventsHelper');
contract('WFAsset', function(accounts) {
  var reverter = new Reverter(web3);
  afterEach('revert', reverter.revert);

  var UINT_256_MINUS_1 = '1.15792089237316195423570985008687907853269984665640564039457584007913129639935e+77';
  var SYMBOL = 'FAKE';
  var SYMBOL2 = 'FAKE2';
  var NAME = 'Test Name';
  var DESCRIPTION = 'Test Description';
  var VALUE = 1001;
  var VALUE2 = 30000;
  var BASE_UNIT = 2;
  var IS_REISSUABLE = false;
  var WFPlatform;
  var WF;
  var WFAssetProxy;
  var stub;

  before('setup others', function(done) {
    Stub.deployed().then(function(instance) {
    stub = instance;
    bmc.new().then(function(instance) {
    WF = instance;
    bmcAssetProxy.new().then(function(instance) {
    WFAssetProxy = instance;
    bmcPlatformTestable.new().then(function(instance) {
    WFPlatform = instance;
    WFPlatform.setupEventsHistory(stub.address).then(function() {
      return WFPlatform.issueAsset(SYMBOL, VALUE, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE);
    }).then(function() {
      return WFPlatform.issueAsset(SYMBOL2, VALUE2, NAME, DESCRIPTION, BASE_UNIT, IS_REISSUABLE);
    }).then(function() {
      return WFAssetProxy.init(WFPlatform.address, SYMBOL, NAME);
    }).then(function() {
      return WFAssetProxy.proposeUpgrade(WF.address);
    }).then(function() {
      return WF.init(WFAssetProxy.address);
    }).then(function() {
      reverter.snapshot(done);
    }).catch(done);
   });
   });
   });
   });
  });

  it('should be possible to get total supply', function() {
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.totalSupply();
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    });
  });
  it('should be possible to get balance for holder', function() {
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.balanceOf(accounts[0]);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    });
  });
  it('should be possible to get total supply if not allowed', function() {
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL2).then(function() {
      return WFAssetProxy.totalSupply();
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    });
  });
  it('should be possible to get balance if not allowed', function() {
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL2).then(function() {
      return WFAssetProxy.balanceOf(accounts[0]);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    });
  });
  it('should not emit transfer event from not base', function() {
    var owner = accounts[0];
    var nonOwner = accounts[1];
    var watcher = WFAssetProxy.Transfer();
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL2).then(function() {
      eventsHelper.setupEvents(WFAssetProxy);
      return WFAssetProxy.emitTransfer(owner, nonOwner, 100);
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 0);
    });
  });
  it('should not be possible to transfer if not allowed', function() {
    var owner = accounts[0];
    var nonOwner = accounts[1];
    var watcher = WFAssetProxy.Transfer();
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL2).then(function() {
      eventsHelper.setupEvents(WFAssetProxy);
      return WFAssetProxy.transfer(nonOwner, 100);
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 0);
      return WFPlatform.balanceOf(nonOwner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return WFPlatform.balanceOf(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    });
  });
  it('should not be possible to transfer amount 1 with balance 0', function() {
    var owner = accounts[0];
    var nonOwner = accounts[1];
    var amount = 1;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.transfer(nonOwner, VALUE);
    }).then(function() {
      return WFAssetProxy.transfer(nonOwner, amount);
    }).then(function() {
      return WFPlatform.balanceOf(nonOwner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
      return WFPlatform.balanceOf(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    });
  });
  it('should not be possible to transfer amount 2 with balance 1', function() {
    var owner = accounts[0];
    var nonOwner = accounts[1];
    var value = 1;
    var amount = 2;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.transfer(nonOwner, VALUE - value);
    }).then(function() {
      return WFAssetProxy.transfer(nonOwner, amount);
    }).then(function() {
      return WFPlatform.balanceOf(nonOwner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE - value);
      return WFPlatform.balanceOf(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    });
  });
  it('should not be possible to transfer amount 0', function() {
    var owner = accounts[0];
    var nonOwner = accounts[1];
    var amount = 0;
    var watcher = WFAssetProxy.Transfer();
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      eventsHelper.setupEvents(WFAssetProxy);
      return WFAssetProxy.transfer(nonOwner, amount);
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 0);
      return WFPlatform.balanceOf(nonOwner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return WFPlatform.balanceOf(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    });
  });
  it('should not be possible to transfer to oneself', function() {
    var owner = accounts[0];
    var amount = 100;
    var watcher = WFAssetProxy.Transfer();
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      eventsHelper.setupEvents(WFPlatform);
      return WFAssetProxy.transfer(owner, amount);
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 0);
      return WFPlatform.balanceOf(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
      return WFPlatform.balanceOf(owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    });
  });
  it('should be possible to transfer amount 1 to existing holder with 0 balance', function() {
    var holder = accounts[0];
    var holder2 = accounts[1];
    var amount = 1;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.transfer(holder2, VALUE);
    }).then(function() {
      return WFAssetProxy.transfer(holder, amount, {from: holder2});
    }).then(function() {
      return WFPlatform.balanceOf(holder2, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE - amount);
      return WFPlatform.balanceOf(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), amount);
    });
  });
  it('should be possible to transfer amount 1 to missing holder', function() {
    var holder = accounts[0];
    var holder2 = accounts[1];
    var amount = 1;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.transfer(holder2, amount);
    }).then(function() {
      return WFPlatform.balanceOf(holder2, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), amount);
      return WFPlatform.balanceOf(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE - amount);
    });
  });
  it('should be possible to transfer amount 1 to holder with non-zero balance', function() {
    var holder = accounts[0];
    var holder2 = accounts[1];
    var balance2 = 100;
    var amount = 1;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.transfer(holder2, balance2);
    }).then(function() {
      return WFAssetProxy.transfer(holder2, amount);
    }).then(function() {
      return WFPlatform.balanceOf(holder2, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), balance2 + amount);
      return WFPlatform.balanceOf(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE - balance2 - amount);
    });
  });
  it('should keep transfers separated between WFAssets', function() {
    var holder = accounts[0];
    var holder2 = accounts[1];
    var amount = 100;
    var watcher;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      eventsHelper.setupEvents(WFAssetProxy);
      watcher = WFAssetProxy.Transfer();
      return WFAssetProxy.transfer(holder2, amount);
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 1);
      assert.equal(events[0].args.from.valueOf(), holder);
      assert.equal(events[0].args.to.valueOf(), holder2);
      assert.equal(events[0].args.value.valueOf(), amount);
      return WFPlatform.balanceOf(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE - amount);
      return WFPlatform.balanceOf(holder2, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), amount);
      return WFPlatform.balanceOf(holder, SYMBOL2);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE2);
      return WFPlatform.balanceOf(holder2, SYMBOL2);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    });
  });
  it('should emit transfer event from base', function() {
    var holder = accounts[0];
    var holder2 = accounts[1];
    var amount = 100;
    var watcher;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      eventsHelper.setupEvents(WFAssetProxy);
      watcher = WFAssetProxy.Transfer();
      return WFPlatform.transfer(holder2, amount, SYMBOL);
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 1);
      assert.equal(events[0].args.from.valueOf(), holder);
      assert.equal(events[0].args.to.valueOf(), holder2);
      assert.equal(events[0].args.value.valueOf(), amount);
    });
  });

  it('should not be possible to set allowance for oneself', function() {
    var owner = accounts[0];
    var watcher;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      eventsHelper.setupEvents(WFAssetProxy);
      watcher = WFAssetProxy.Approval();
      return WFAssetProxy.approve(owner, 100);
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 0);
      return WFPlatform.allowance(owner, owner, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    });
  });
  it('should be possible to set allowance from missing holder to missing holder', function() {
    var holder = accounts[1];
    var spender = accounts[2];
    var value = 100;
    var watcher;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      eventsHelper.setupEvents(WFAssetProxy);
      watcher = WFAssetProxy.Approval();
      return WFAssetProxy.approve(spender, value, {from: holder});
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 1);
      assert.equal(events[0].args.from.valueOf(), holder);
      assert.equal(events[0].args.spender.valueOf(), spender);
      assert.equal(events[0].args.value.valueOf(), value);
      return WFAssetProxy.allowance(holder, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
      return WFAssetProxy.allowance(holder, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    });
  });
  it('should emit allowance from base', function() {
    var holder = accounts[1];
    var spender = accounts[2];
    var value = 100;
    var watcher;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      eventsHelper.setupEvents(WFAssetProxy);
      watcher = WFAssetProxy.Approval();
      return WFPlatform.approve(spender, value, SYMBOL, {from: holder});
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 1);
      assert.equal(events[0].args.from.valueOf(), holder);
      assert.equal(events[0].args.spender.valueOf(), spender);
      assert.equal(events[0].args.value.valueOf(), value);
    });
  });
  it('should be possible to set allowance from missing holder to existing holder', function() {
    var holder = accounts[1];
    var spender = accounts[0];
    var value = 100;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.approve(spender, value, {from: holder});
    }).then(function() {
      return WFAssetProxy.allowance(holder, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    });
  });
  it('should be possible to set allowance from existing holder to missing holder', function() {
    var holder = accounts[0];
    var spender = accounts[2];
    var value = 100;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.approve(spender, value, {from: holder});
    }).then(function() {
      return WFAssetProxy.allowance(holder, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    });
  });
  it('should be possible to set allowance from existing holder to existing holder', function() {
    var holder = accounts[0];
    var spender = accounts[2];
    var value = 100;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.transfer(spender, 1, {from: holder});
    }).then(function() {
      return WFAssetProxy.approve(spender, value, {from: holder});
    }).then(function() {
      return WFAssetProxy.allowance(holder, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    });
  });
  it('should be possible to set allowance value 0', function() {
    // Covered by 'should be possible to override allowance value with 0 value'.
  });
  it('should be possible to set allowance with (2**256 - 1) value', function() {
    var holder = accounts[0];
    var spender = accounts[1];
    var value = UINT_256_MINUS_1;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.approve(spender, value);
    }).then(function() {
      return WFAssetProxy.allowance(holder, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    });
  });
  it('should be possible to set allowance value less then balance', function() {
    var holder = accounts[0];
    var spender = accounts[1];
    var value = 1;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.approve(spender, value);
    }).then(function() {
      return WFAssetProxy.allowance(holder, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    });
  });
  it('should be possible to set allowance value equal to balance', function() {
    var holder = accounts[0];
    var spender = accounts[1];
    var value = VALUE;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.approve(spender, value);
    }).then(function() {
      return WFAssetProxy.allowance(holder, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    });
  });
  it('should be possible to set allowance value more then balance', function() {
    // Covered by 'should be possible to set allowance with (2**256 - 1) value'.
  });
  it('should be possible to override allowance value with 0 value', function() {
    var holder = accounts[0];
    var spender = accounts[1];
    var value = 0;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.approve(spender, 100);
    }).then(function() {
      return WFAssetProxy.approve(spender, value);
    }).then(function() {
      return WFAssetProxy.allowance(holder, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    });
  });
  it('should be possible to override allowance value with non 0 value', function() {
    var holder = accounts[0];
    var spender = accounts[1];
    var value = 1000;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.approve(spender, 100);
    }).then(function() {
      return WFAssetProxy.approve(spender, value);
    }).then(function() {
      return WFAssetProxy.allowance(holder, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    });
  });
  it('should not affect balance when setting allowance', function() {
    var holder = accounts[0];
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.approve(accounts[1], 100);
    }).then(function() {
      return WFPlatform.balanceOf(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    });
  });
  it('should be possible to set allowance', function() {
    // Covered by other tests above.
  });

  it('should not be possible to do allowance transfer if not allowed', function() {
    var holder = accounts[0];
    var spender = accounts[1];
    var watcher;
    return WFPlatform.approve(spender, 50, SYMBOL).then(function() {
      eventsHelper.setupEvents(WFAssetProxy);
      watcher = WFAssetProxy.Transfer();
      return WFAssetProxy.transferFrom(holder, spender, 50, {from: spender});
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 0);
      return WFPlatform.balanceOf(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    });
  });
  it('should not be possible to do allowance transfer by not allowed existing spender, from existing holder', function() {
    var holder = accounts[0];
    var spender = accounts[1];
    var value = 100;
    var expectedSpenderBalance = 100;
    var expectedHolderBalance = VALUE - value;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.transfer(spender, value);
    }).then(function() {
      return WFAssetProxy.transferFrom(holder, spender, 50, {from: spender});
    }).then(function() {
      return WFPlatform.balanceOf(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedSpenderBalance);
      return WFPlatform.balanceOf(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedHolderBalance);
    });
  });
  it('should not be possible to do allowance transfer by not allowed existing spender, from missing holder', function() {
    var holder = accounts[2];
    var spender = accounts[1];
    var value = 100;
    var expectedSpenderBalance = 100;
    var expectedHolderBalance = 0;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.transfer(spender, value);
    }).then(function() {
      return WFAssetProxy.transferFrom(holder, spender, 50, {from: spender});
    }).then(function() {
      return WFPlatform.balanceOf(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedSpenderBalance);
      return WFPlatform.balanceOf(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedHolderBalance);
    });
  });
  it('should not be possible to do allowance transfer by not allowed missing spender, from existing holder', function() {
    var holder = accounts[0];
    var spender = accounts[1];
    var expectedSpenderBalance = 0;
    var expectedHolderBalance = VALUE;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.transferFrom(holder, spender, 50, {from: spender});
    }).then(function() {
      return WFPlatform.balanceOf(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedSpenderBalance);
      return WFPlatform.balanceOf(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedHolderBalance);
    });
  });
  it('should not be possible to do allowance transfer by not allowed missing spender, from missing holder', function() {
    var holder = accounts[2];
    var spender = accounts[1];
    var expectedSpenderBalance = 0;
    var expectedHolderBalance = 0;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.transferFrom(holder, spender, 50, {from: spender});
    }).then(function() {
      return WFPlatform.balanceOf(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedSpenderBalance);
      return WFPlatform.balanceOf(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedHolderBalance);
    });
  });
  it('should not be possible to do allowance transfer from and to the same holder', function() {
    var holder = accounts[0];
    var spender = accounts[1];
    var watcher;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.approve(spender, 50);
    }).then(function() {
      eventsHelper.setupEvents(WFPlatform);
      watcher = WFAssetProxy.Transfer();
      return WFAssetProxy.transferFrom(holder, holder, 50, {from: spender});
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 0);
      return WFPlatform.balanceOf(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    });
  });
  it('should be possible to do allowance transfer from oneself', function() {
    var holder = accounts[0];
    var receiver = accounts[1];
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.transferFrom(holder, receiver, 50);
    }).then(function() {
      return WFPlatform.balanceOf(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE - 50);
      return WFPlatform.balanceOf(receiver, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 50);
      return WFPlatform.allowance(holder, holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    });
  });
  it('should not be possible to do allowance transfer with 0 value', function() {
    var holder = accounts[0];
    var spender = accounts[1];
    var value = 0;
    var resultValue = 0;
    var watcher;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.approve(spender, 100);
    }).then(function() {
      eventsHelper.setupEvents(WFPlatform);
      watcher = WFAssetProxy.Transfer();
      return WFAssetProxy.transferFrom(holder, spender, value, {from: spender});
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 0);
      return WFPlatform.balanceOf(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
      return WFPlatform.balanceOf(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), resultValue);
    });
  });
  it('should not be possible to do allowance transfer with value less than balance, more than allowed', function() {
    var holder = accounts[0];
    var spender = accounts[1];
    var balance = VALUE;
    var value = 999;
    var allowed = 998;
    var resultValue = 0;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.approve(spender, allowed);
    }).then(function() {
      return WFAssetProxy.transferFrom(holder, spender, value, {from: spender});
    }).then(function() {
      return WFPlatform.balanceOf(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), balance);
      return WFPlatform.balanceOf(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), resultValue);
    });
  });
  it('should not be possible to do allowance transfer with value equal to balance, more than allowed', function() {
    var holder = accounts[0];
    var spender = accounts[1];
    var balance = VALUE;
    var value = VALUE;
    var allowed = 999;
    var resultValue = 0;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.approve(spender, allowed);
    }).then(function() {
      return WFAssetProxy.transferFrom(holder, spender, value, {from: spender});
    }).then(function() {
      return WFPlatform.balanceOf(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), balance);
      return WFPlatform.balanceOf(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), resultValue);
    });
  });
  it('should not be possible to do allowance transfer with value more than balance, less than allowed', function() {
    var holder = accounts[0];
    var spender = accounts[1];
    var balance = VALUE;
    var value = VALUE + 1;
    var allowed = value + 1;
    var resultValue = 0;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.approve(spender, allowed);
    }).then(function() {
      return WFAssetProxy.transferFrom(holder, spender, value, {from: spender});
    }).then(function() {
      return WFPlatform.balanceOf(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), balance);
      return WFPlatform.balanceOf(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), resultValue);
    });
  });
  it('should not be possible to do allowance transfer with value less than balance, more than allowed after another tranfer', function() {
    var holder = accounts[0];
    var spender = accounts[1];
    var balance = VALUE;
    var anotherValue = 10;
    var value = VALUE - anotherValue - 1;
    var allowed = value - 1;
    var expectedHolderBalance = balance - anotherValue;
    var resultValue = anotherValue;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.approve(spender, allowed);
    }).then(function() {
      return WFAssetProxy.transferFrom(holder, spender, anotherValue, {from: spender});
    }).then(function() {
      return WFAssetProxy.transferFrom(holder, spender, value, {from: spender});
    }).then(function() {
      return WFPlatform.balanceOf(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedHolderBalance);
      return WFPlatform.balanceOf(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), resultValue);
    });
  });
  it('should not be possible to do allowance transfer when allowed for another symbol', function() {
    var holder = accounts[0];
    var spender = accounts[1];
    var balance = VALUE;
    var value = 200;
    var allowed = 1000;
    var resultValue = 0;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFPlatform.approve(spender, allowed, SYMBOL2);
    }).then(function() {
      return WFAssetProxy.transferFrom(holder, spender, value, {from: spender});
    }).then(function() {
      return WFPlatform.balanceOf(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), balance);
      return WFPlatform.balanceOf(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), resultValue);
      return WFPlatform.balanceOf(holder, SYMBOL2);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE2);
      return WFPlatform.balanceOf(spender, SYMBOL2);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    });
  });
  it('should be possible to do allowance transfer by allowed existing spender', function() {
    var holder = accounts[0];
    var spender = accounts[1];
    var existValue = 100;
    var value = 300;
    var expectedHolderBalance = VALUE - existValue - value;
    var expectedSpenderBalance = existValue + value;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.transfer(spender, existValue);
    }).then(function() {
      return WFAssetProxy.approve(spender, value);
    }).then(function() {
      return WFAssetProxy.transferFrom(holder, spender, value, {from: spender});
    }).then(function() {
      return WFPlatform.balanceOf(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedHolderBalance);
      return WFPlatform.balanceOf(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedSpenderBalance);
    });
  });
  it('should be possible to do allowance transfer by allowed missing spender', function() {
    var holder = accounts[0];
    var spender = accounts[1];
    var value = 300;
    var expectedHolderBalance = VALUE - value;
    var expectedSpenderBalance = value;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.approve(spender, value);
    }).then(function() {
      return WFAssetProxy.transferFrom(holder, spender, value, {from: spender});
    }).then(function() {
      return WFPlatform.balanceOf(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedHolderBalance);
      return WFPlatform.balanceOf(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedSpenderBalance);
    });
  });
  it('should be possible to do allowance transfer to oneself', function() {
    // Covered by 'should be possible to do allowance transfer by allowed existing spender'.
  });
  it('should be possible to do allowance transfer to existing holder', function() {
    var holder = accounts[0];
    var spender = accounts[1];
    var receiver = accounts[2];
    var existValue = 100;
    var value = 300;
    var expectedHolderBalance = VALUE - existValue - value;
    var expectedReceiverBalance = existValue + value;
    var watcher;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.transfer(receiver, existValue);
    }).then(function() {
      return WFAssetProxy.approve(spender, value);
    }).then(function() {
      eventsHelper.setupEvents(WFAssetProxy);
      watcher = WFAssetProxy.Transfer();
      return WFAssetProxy.transferFrom(holder, receiver, value, {from: spender});
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 1);
      assert.equal(events[0].args.from.valueOf(), holder);
      assert.equal(events[0].args.to.valueOf(), receiver);
      assert.equal(events[0].args.value.valueOf(), value);
      return WFPlatform.balanceOf(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedHolderBalance);
      return WFPlatform.balanceOf(receiver, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedReceiverBalance);
    });
  });
  it('should emit allowance transfer event from base', function() {
    var holder = accounts[0];
    var spender = accounts[1];
    var receiver = accounts[2];
    var existValue = 100;
    var value = 300;
    var watcher;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.transfer(receiver, existValue);
    }).then(function() {
      return WFAssetProxy.approve(spender, value);
    }).then(function() {
      eventsHelper.setupEvents(WFAssetProxy);
      watcher = WFAssetProxy.Transfer();
      return WFPlatform.transferFrom(holder, receiver, value, SYMBOL, {from: spender});
    }).then(function(txHash) {
      return eventsHelper.getEvents(txHash, watcher);
    }).then(function(events) {
      assert.equal(events.length, 1);
      assert.equal(events[0].args.from.valueOf(), holder);
      assert.equal(events[0].args.to.valueOf(), receiver);
      assert.equal(events[0].args.value.valueOf(), value);
    });
  });
  it('should be possible to do allowance transfer to missing holder', function() {
    var holder = accounts[0];
    var spender = accounts[1];
    var receiver = accounts[2];
    var value = 300;
    var expectedHolderBalance = VALUE - value;
    var expectedReceiverBalance = value;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.approve(spender, value);
    }).then(function() {
      return WFAssetProxy.transferFrom(holder, receiver, value, {from: spender});
    }).then(function() {
      return WFPlatform.balanceOf(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedHolderBalance);
      return WFPlatform.balanceOf(receiver, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedReceiverBalance);
    });
  });
  it('should be possible to do allowance transfer with value less than balance and less than allowed', function() {
    var holder = accounts[0];
    var spender = accounts[1];
    var balance = VALUE;
    var value = balance - 1;
    var allowed = value + 1;
    var expectedHolderBalance = balance - value;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.approve(spender, allowed);
    }).then(function() {
      return WFAssetProxy.transferFrom(holder, spender, value, {from: spender});
    }).then(function() {
      return WFPlatform.balanceOf(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedHolderBalance);
      return WFPlatform.balanceOf(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    });
  });
  it('should be possible to do allowance transfer with value less than balance and equal to allowed', function() {
    var holder = accounts[0];
    var spender = accounts[1];
    var balance = VALUE;
    var value = balance - 1;
    var allowed = value;
    var expectedHolderBalance = balance - value;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.approve(spender, allowed);
    }).then(function() {
      return WFAssetProxy.transferFrom(holder, spender, value, {from: spender});
    }).then(function() {
      return WFPlatform.balanceOf(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedHolderBalance);
      return WFPlatform.balanceOf(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    });
  });
  it('should be possible to do allowance transfer with value equal to balance and less than allowed', function() {
    var holder = accounts[0];
    var spender = accounts[1];
    var balance = VALUE;
    var value = balance;
    var allowed = value + 1;
    var expectedHolderBalance = balance - value;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.approve(spender, allowed);
    }).then(function() {
      return WFAssetProxy.transferFrom(holder, spender, value, {from: spender});
    }).then(function() {
      return WFPlatform.balanceOf(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedHolderBalance);
      return WFPlatform.balanceOf(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    });
  });
  it('should be possible to do allowance transfer with value equal to balance and equal to allowed', function() {
    var holder = accounts[0];
    var spender = accounts[1];
    var balance = VALUE;
    var value = balance;
    var allowed = value;
    var expectedHolderBalance = balance - value;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.approve(spender, allowed);
    }).then(function() {
      return WFAssetProxy.transferFrom(holder, spender, value, {from: spender});
    }).then(function() {
      return WFPlatform.balanceOf(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedHolderBalance);
      return WFPlatform.balanceOf(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    });
  });
  it('should be possible to do allowance transfer with value less than balance and less than allowed after another transfer', function() {
    var holder = accounts[0];
    var spender = accounts[1];
    var balance = VALUE;
    var anotherValue = 1;
    var value = balance - anotherValue - 1;
    var allowed = value + 1;
    var expectedSpenderBalance = anotherValue + value;
    var expectedHolderBalance = balance - anotherValue - value;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.approve(spender, allowed);
    }).then(function() {
      return WFAssetProxy.transferFrom(holder, spender, anotherValue, {from: spender});
    }).then(function() {
      return WFAssetProxy.transferFrom(holder, spender, value, {from: spender});
    }).then(function() {
      return WFPlatform.balanceOf(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedHolderBalance);
      return WFPlatform.balanceOf(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedSpenderBalance);
    });
  });
  it('should be possible to do allowance transfer with value less than balance and equal to allowed after another transfer', function() {
    var holder = accounts[0];
    var spender = accounts[1];
    var balance = VALUE;
    var anotherValue = 1;
    var value = balance - anotherValue - 1;
    var allowed = value + anotherValue;
    var expectedSpenderBalance = anotherValue + value;
    var expectedHolderBalance = balance - anotherValue - value;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.approve(spender, allowed);
    }).then(function() {
      return WFAssetProxy.transferFrom(holder, spender, anotherValue, {from: spender});
    }).then(function() {
      return WFAssetProxy.transferFrom(holder, spender, value, {from: spender});
    }).then(function() {
      return WFPlatform.balanceOf(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedHolderBalance);
      return WFPlatform.balanceOf(spender, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), expectedSpenderBalance);
    });
  });

  it('should return allowance when not allowed', function() {
    var holder = accounts[0];
    var spender = accounts[1];
    var value = 100;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.approve(spender, value);
    }).then(function() {
      return WFAssetProxy.allowance(holder, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    });
  });
  it('should return 0 allowance for existing owner and not allowed existing spender', function() {
    var holder = accounts[0];
    var spender = accounts[1];
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.transfer(spender, 100);
    }).then(function() {
      return WFAssetProxy.allowance(holder, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    });
  });
  it('should return 0 allowance for existing owner and not allowed missing spender', function() {
    var holder = accounts[0];
    var spender = accounts[1];
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.allowance(holder, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    });
  });
  it('should return 0 allowance for missing owner and existing spender', function() {
    var holder = accounts[1];
    var spender = accounts[0];
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.allowance(holder, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    });
  });
  it('should return 0 allowance for missing owner and missing spender', function() {
    var holder = accounts[1];
    var spender = accounts[2];
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.allowance(holder, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    });
  });
  it('should return 0 allowance for existing oneself', function() {
    var holder = accounts[0];
    var spender = holder;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.allowance(holder, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    });
  });
  it('should return 0 allowance for missing oneself', function() {
    var holder = accounts[1];
    var spender = holder;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.allowance(holder, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
    });
  });
  it('should respect holder when telling allowance', function() {
    var holder = accounts[0];
    var holder2 = accounts[1];
    var spender = accounts[2];
    var value = 100;
    var value2 = 200;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.approve(spender, value);
    }).then(function() {
      return WFAssetProxy.approve(spender, value2, {from: holder2});
    }).then(function() {
      return WFAssetProxy.allowance(holder, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
      return WFAssetProxy.allowance(holder2, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), value2);
    });
  });
  it('should respect spender when telling allowance', function() {
    var holder = accounts[0];
    var spender = accounts[1];
    var spender2 = accounts[2];
    var value = 100;
    var value2 = 200;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.approve(spender, value);
    }).then(function() {
      return WFAssetProxy.approve(spender2, value2);
    }).then(function() {
      return WFAssetProxy.allowance(holder, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
      return WFAssetProxy.allowance(holder, spender2);
    }).then(function(result) {
      assert.equal(result.valueOf(), value2);
    });
  });
  it('should be possible to check allowance of existing owner and allowed existing spender', function() {
    var holder = accounts[0];
    var spender = accounts[1];
    var value = 300;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.transfer(spender, 100);
    }).then(function() {
      return WFAssetProxy.approve(spender, value);
    }).then(function() {
      return WFAssetProxy.allowance(holder, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    });
  });
  it('should be possible to check allowance of existing owner and allowed missing spender', function() {
    var holder = accounts[0];
    var spender = accounts[1];
    var value = 300;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.approve(spender, value);
    }).then(function() {
      return WFAssetProxy.allowance(holder, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), value);
    });
  });
  it('should return 0 allowance after another transfer', function() {
    var holder = accounts[0];
    var spender = accounts[1];
    var value = 300;
    var resultValue = 0;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.approve(spender, value);
    }).then(function() {
      return WFAssetProxy.transferFrom(holder, spender, value, {from: spender});
    }).then(function() {
      return WFAssetProxy.allowance(holder, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), resultValue);
    });
  });
  it('should return 1 allowance after another transfer', function() {
    var holder = accounts[0];
    var spender = accounts[1];
    var receiver = accounts[2];
    var value = 300;
    var transfer = 299;
    var resultValue = 1;
    return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL).then(function() {
      return WFAssetProxy.approve(spender, value);
    }).then(function() {
      return WFAssetProxy.transferFrom(holder, receiver, transfer, {from: spender});
    }).then(function() {
      return WFAssetProxy.allowance(holder, spender);
    }).then(function(result) {
      assert.equal(result.valueOf(), resultValue);
    });
  });

  it('should not be possible to change proxy', function() {
    var holder = accounts[0];
    var holder2 = accounts[1];
    var balance2 = 100;
    return WFPlatform.setProxy('0x1', SYMBOL).then(function() {
      return WFPlatform.setProxy(WFAssetProxy.address, SYMBOL);
    }).then(function() {
      return WFAssetProxy.transfer(holder2, balance2);
    }).then(function() {
      return WFPlatform.balanceOf(holder2, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), 0);
      return WFPlatform.balanceOf(holder, SYMBOL);
    }).then(function(result) {
      assert.equal(result.valueOf(), VALUE);
    });
  });
});
