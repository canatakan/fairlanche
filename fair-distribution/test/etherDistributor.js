const EtherDistributor = artifacts.require("EtherDistributor");

contract("EtherDistributor", (accounts) => {

    let etherDistributorInstance;
    
    before("Setup contract", async () => {
        etherDistributorInstance = await EtherDistributor.deployed();
    });

    it("should make the first account owner", async () => {
        const owner = await etherDistributorInstance.owner();
        assert.equal(owner, accounts[0]);
    });
});
