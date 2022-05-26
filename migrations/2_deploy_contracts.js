var PandaToken = artifacts.require("./PandaToken.sol");
var PandaTokenSale = artifacts.require("./PandaTokenSale.sol");

module.exports = function(deployer) {
  deployer.deploy(PandaToken, 10000000).then(function() {
    return deployer.deploy(PandaTokenSale, PandaToken.address, 1000000000000000);
  })
};
