// SPDX-License-Identifier: GPL-3.0
        
pragma solidity >=0.4.22 <0.9.0;

// This import is automatically injected by Remix
import "remix_tests.sol"; 

// This import is required to use custom transaction context
// Although it may fail compilation in 'Solidity Compiler' plugin
// But it will work fine in 'Solidity Unit Testing' plugin
import "remix_accounts.sol";
import "../contracts/EtherDistributor.sol";


contract TestEtherDistributor is EtherDistributor {

    function updateState() public {
        return _updateState();
    }


    function calculateShare()
        public
        view
        returns (uint16 _share, uint256 _amount)
    {
        return super._calculateShare();
    }
    
}


// File name has to end with '_test.sol', this file can contain more than one testSuite contracts
contract testSuite {

    TestEtherDistributor etherDistributor;
    
    // 'beforeAll' runs before all other tests
    function beforeAll() public {
        etherDistributor = new EtherDistributor();
        etherDistributor.addPermissionedUser(payable(address(this)));
    }

    function checkOwner() public {
        Assert.equal(etherDistributor.owner(), payable(address(this)), "Invalid owner");
    }

    function checkDemands() public {
        uint8[13] memory demandArray = [1, 1, 1, 2, 2, 3, 5, 5, 5, 7, 7, 7, 7];
        for(uint256 i = 0; i < demandArray.length; i++) {
            etherDistributor.demand(demandArray[i]);
        }
        Assert.equal(etherDistributor.totalDemand(), 13, "Invalid demand count");
    }

    function checkCalculateShare() public {

        (uint16 share, uint256 distribution) =  etherDistributor.calculateShare();
        
        Assert.equal(share, 6, "Invalid share");
        Assert.equal(distribution, 49, "Invalid distribution amount");
    }

}
    