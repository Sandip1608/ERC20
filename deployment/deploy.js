async function main(){

    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const weiAmount = (await deployer.getBalance()).toString();
  
    console.log("Account balance:", (await ethers.utils.formatEther(weiAmount)));

    const ABCToken = await ethers.getContractFactory('ABCToken');
    const token = await ABCToken.deploy('10000000000000000000000');

    await token.deployed();
    console.log("ABCToken deployed to:", token.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });