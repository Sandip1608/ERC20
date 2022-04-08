// We import Chai to use its asserting functions here.
const { expect } = require("chai");
const { Wallet, Contract } = require("ethers");
const { ethers } = require("hardhat");

describe("ABCToken contract", function () {
  let totalSupply = '10000000000000000000000'; // 10000 * 1e18
  let Token;
  let hardhatToken;
  let owner;
  let addr1;
  let addr2;
  let addr3;
  let addrs;

  beforeEach(async function () {
    Token = await ethers.getContractFactory("ABCToken");
    [owner, addr1, addr2,addr3, ...addrs] = await ethers.getSigners();

    hardhatToken = await Token.deploy(totalSupply);
  });

  describe("Deployment", function () {

    it("Should return the correct contract name", async() => {
      expect(await hardhatToken.name()).to.equal('ABC');
    });

    it("Should return the correct contract symbol", async() => {
      expect(await hardhatToken.symbol()).to.equal('ABC');
    });

    it("Should have 18 decimal", async() => {
      expect(await hardhatToken.decimals()).to.equal(18);
    });
    
    it('has expected total supply', async () => {
      const actualTotalSupply = await hardhatToken.totalSupply();
      expect(actualTotalSupply).to.equal(totalSupply);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await hardhatToken.balanceOf(owner.address);
      expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Transactions", function () {

    it("Should transfer tokens between accounts", async function () {
      const ownerBalance = await hardhatToken.balanceOf(owner.address);
      await hardhatToken.transfer(addr1.address, 50);
      const addr1Balance = await hardhatToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(50);
      await hardhatToken.connect(addr1).transfer(addr2.address, 50);
      const addr2Balance = await hardhatToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });

    it("Should transferFrom tokens between accounts", async function () {
      const amount = 10;
      await hardhatToken.approve(addr1.address, amount);
      const delegate = hardhatToken.connect(addr1);
      await delegate.transferFrom(owner.address, addr3.address, amount);
      const recipientBalance = await hardhatToken.balanceOf(addr3.address)
      expect(recipientBalance).to.equal(amount);
    });

    it('approves allowance for expected amount', async () => {
      const amount = 10;
      await hardhatToken.approve(addr1.address, amount);
      const addr1Balance = await hardhatToken.balanceOf(addr1.address);
      // console.log(addr1Balance);
      const allowance = await hardhatToken.allowance(owner.address, addr1.address);
      expect(allowance).to.equal(amount);
      // console.log(allowance);
    });

    it('increases the allowance', async() => {
      const amount = 10;
      const amount_to_be_increased = 20;
      const final = 30;

      await hardhatToken.approve(addr1.address, amount);
      const addr1Balance = await hardhatToken.balanceOf(addr1.address);

      const allowance = await hardhatToken.allowance(owner.address, addr1.address);
      console.log(allowance);

      await hardhatToken.approve(addr1.address, amount_to_be_increased);
      await hardhatToken.increaseAllowance(addr1.address, amount_to_be_increased);
      await hardhatToken.connect(addr1).transferFrom(owner.address, addr2.address, final);
      const Balance = await hardhatToken.balanceOf(addr2.address);
      expect(Balance).to.equal(30);

    });

    it('decreases the allowance', async() => {
      const amount = 50;
      const amount_to_be_decreased = 20;
      const final = 30;

      await hardhatToken.approve(addr1.address, amount);
      const addr1Balance = await hardhatToken.balanceOf(addr1.address);

      const allowance = await hardhatToken.allowance(owner.address, addr1.address);
      console.log(allowance);
 
      await hardhatToken.decreaseAllowance(addr1.address, amount_to_be_decreased);
      await hardhatToken.connect(addr1).transferFrom(owner.address, addr2.address, final);
      const Balance = await hardhatToken.balanceOf(addr2.address);
      expect(Balance).to.equal(30);

    });



    it('emits Approval event', async () => {
      await expect(hardhatToken.approve(addr1.address, 1))
        .to.emit(hardhatToken, 'Approval')
        .withArgs(owner.address, addr1.address, 1);
    });


    it("Should fail if sender doesn’t have enough tokens", async function () {
      const initialOwnerBalance = await hardhatToken.balanceOf(owner.address);
      await expect(
        hardhatToken.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
      expect(await hardhatToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });

  });
});