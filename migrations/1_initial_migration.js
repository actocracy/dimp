const { strict: assert } = require('assert');

const DIMP = artifacts.require("DIMP");

const Addresses = {
  PreSeed: process.env.PRESEED_ADDRESS,
  Seed: process.env.SEED_ADDRESS,
  PrivateA: process.env.PRIVATEA_ADDRESS,
  PrivateB: process.env.PRIVATEB_ADDRESS,
  Public: process.env.PUBLIC_ADDRESS,
  Advisors: process.env.ADVISORS_ADDRESS,
  Team: process.env.TEAM_ADDRESS,
  Partnership: process.env.PARTNERSHIP_ADDRESS,
  Ecosystem: process.env.ECOSYSTEM_ADDRESS,
  GameActivity: process.env.GAMEACTIVITY_ADDRESS,
  LiquidityPool: process.env.LIQUIDITYPOOL_ADDRESS
}

module.exports = async function (deployer) {
  let allocations;

  const totalSupply = 237279209162n * 10n**6n;

  const percentage = (percent) => (totalSupply * percent) / 1000n;

    allocations = [
      // pre-seed
      { address: Addresses.PreSeed, tokens: percentage(5n) },

      // seed
      { address: Addresses.Seed, tokens: percentage(20n) },

      // private sale 1
      { address: Addresses.PrivateA, tokens: percentage(50n) },

      // private sale 2
      { address: Addresses.PrivateB, tokens: percentage(50n) },

      // public sale
      { address: Addresses.Public, tokens: percentage(15n) },

      // advisors
      { address: Addresses.Advisors, tokens: percentage(10n) },

      // team & development
      { address: Addresses.Team, tokens: percentage(150n) },

      // partnerships
      { address: Addresses.Partnership, tokens: percentage(60n) },

      // ecosystem
      { address: Addresses.Ecosystem, tokens: percentage(100n) },

      // game activities
      { address: Addresses.GameActivity, tokens: percentage(300n) },

      // liquidity pool
      { address: Addresses.LiquidityPool, tokens: percentage(240n) },

    ];

  const totalAllocated = allocations.reduce((a, b) => a + b.tokens, 0n);
  const totalPercent = Number(totalAllocated * (100n * 1000n) / totalSupply) / 1000;

  assert(totalPercent === 100, `allocations must add up to 100% but is ${totalPercent}%`);
  assert(totalAllocated === totalSupply, `allocations must add up to ${totalSupply} but is ${totalAllocated}`);
  // for (const k in CONTRACTS) {
  //   assert(!!CONTRACTS[k], `env.${k} is missing`);
  // }

  await deployer.deploy(
    DIMP,
    allocations.map(({ address }) => address),
    allocations.map(({ tokens }) => tokens.toString()),
    Addresses.LiquidityPool,
    Addresses.Ecosystem,
    Addresses.Partnership
  );

  const dimp = await DIMP.deployed();

  console.log("DIMP deployed at:", dimp.address);
};
