const BN = require('bn.js');
const truffleAssertions = require('truffle-assertions');

const DIMPToken = artifacts.require('DIMP');

const deployToken = (name, symbol) => {
  return DIMPToken.new(name, symbol);
};

contract('DIMP', (accounts) => {
  let tokenA, tokenB;
  let swap;

  const totalSupply = new BN('800000000000000000000000000', 10);
  const verifiedNode = accounts[1];

  before(async () => {
    tokenA = await deployToken("TestTokenA", "TTA");
    tokenB = await deployToken("TestTokenB", "TTB");
    assert.ok(tokenA);
    assert.ok(tokenB);

    swap = await Swap.new(tokenA.address, tokenB.address, verifiedNode);

    await tokenA.approve(swap.address, totalSupply, {from: accounts[0]});
    await tokenB.approve(swap.address, totalSupply, {from: accounts[0]});
  });

  it('should put 800 million TestTokenA & TestTokenB in the first account', async () => {
    const balanceA = await tokenA.balanceOf.call(accounts[0]);
    assert(
      balanceA.valueOf().eq(totalSupply),
      "800000000 TTA wasn't in the first account"
    );

    const balanceB = await tokenB.balanceOf.call(accounts[0]);
    assert(
      balanceB.valueOf().eq(totalSupply),
      "800000000 TTB wasn't in the first account"
    );
  });

  it('should add liquidity correctly in the swap contract', async () => {
    const amountA = new BN('1000000000000000000000000');  // 1M
    const amountB = new BN('10000000000000000000000000');  // 10M

    await swap.addLiquidity(amountA, amountB);

    const balanceA = await tokenA.balanceOf.call(swap.address);
    assert(
      balanceA.valueOf().eq(amountA),
      "1000000 TTA wasn't in the swap contract"
    );

    const balanceB = await tokenB.balanceOf.call(swap.address);
    assert(
      balanceB.valueOf().eq(amountB),
      "10000000 TTB wasn't in the swap contract"
    );
  });

  it('should swap correctly', async() => {
    const amountA = new BN('1000000000000000000000000', 10);  // 1M
    const amountB = new BN('10000000000000000000000000', 10);  // 10M
    const amountIn = new BN('1000000000000000000000', 10); // 1K
    const rate = new BN('10000000000000000000', 10); // 10 * 10**18

    let result = await swap.swap(amountIn, tokenA.address, tokenB.address);

    truffleAssertions.eventEmitted(result, "RequestRate", (event) => {
      return event.txId.eq(new BN(0));
    });

    result = await swap.updateRate(rate, new BN(0));

    truffleAssertions.eventEmitted(result, "SwapCompleted");

    const balanceA = await tokenA.balanceOf.call(swap.address);
    assert(
      balanceA.valueOf().eq(amountA.add(amountIn)),
      "1001000 TTA wasn't in the swap contract"
    );

    const balanceB = await tokenB.balanceOf.call(swap.address);
    assert(
      balanceB.valueOf().eq(amountB.sub(amountIn.mul(new BN(10)))),
      "9990000 TTB wasn't in the swap contract"
    );
  });

  it('should remove liquidity correctly in the swap contract', async () => {
    const amountA = new BN('1001000000000000000000000');  // 1M
    const amountB = new BN('9990000000000000000000000');  // 10M

    await swap.removeLiquidity(amountA, amountB);

    const balanceA = await tokenA.balanceOf.call(swap.address);
    assert(
      balanceA.valueOf().eq(new BN(0)),
      "1000000 TTA wasn't in the swap contract"
    );

    const balanceB = await tokenB.balanceOf.call(swap.address);
    assert(
      balanceB.valueOf().eq(new BN(0)),
      "10000000 TTB wasn't in the swap contract"
    );
  });
});
