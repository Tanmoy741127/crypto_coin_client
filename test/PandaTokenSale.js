var PandaTokenSale = artifacts.require("./PandaTokenSale.sol");
var PandaToken = artifacts.require("./PandaToken.sol");


contract('PandaTokenSale', (accounts)=>{
    let tokenSale;
    let token;
    let tokenPrice = 1000000000000000;
    var admin = accounts[0];
    var buyer = accounts[1];
    var tokensAvailable = 750000;

    before(async()=>{
        tokenSale = await PandaTokenSale.deployed();
        token = await PandaToken.deployed();
        // provision 75% of all tokens to token sale
        await token.transfer(tokenSale.address, tokensAvailable, {from: admin});
    })

    it('initializes contact with correct values', async()=>{
        const address = await tokenSale.address;
        assert.notEqual(address, 0x0)
        assert.notEqual(address, '')
        assert.notEqual(address, null)
        assert.notEqual(address, undefined)
    })

    it('check token contract', async()=>{
        const contract = await tokenSale.tokenContract();
        assert.notEqual(contract, 0x0, 'has token contract address');
    })

    it('check token price', async()=>{
        const price = await tokenSale.tokenPrice();
        assert.equal(price.toNumber(), tokenPrice, 'token price is correct');
    })

    it('faiciliates token buying', async()=>{
        var numberOfTokens = 100;
        var value = numberOfTokens * tokenPrice;
        var result = await tokenSale.buyTokens(numberOfTokens, { from : buyer, value: value});

        // Check logs
        const event = result.logs[0].args;
        assert.equal(event._buyer, buyer, 'account that purchased tokens');
        assert.equal(event._amount.toNumber(), numberOfTokens, 'number of tokens purchased');

        var amount =  await tokenSale.tokensSold();
        assert.equal(amount.toNumber(), numberOfTokens, 'increments number of tokens sold');
        
        // check balance
        amount = await token.balanceOf(buyer);
        assert.equal(amount.toNumber(), numberOfTokens, 'buyer token balance');

        amount = await token.balanceOf(tokenSale.address);
        assert.equal(amount.toNumber(), tokensAvailable-numberOfTokens, 'updated token balance');

        try {
            await tokenSale.buyTokens(numberOfTokens, { from : buyer, value: value-100})
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0 , 'msg.value must be equal to value of tokens')
        };

        try {
            await tokenSale.buyTokens(800000, { from : buyer, value: value})
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0 , 'cannot purchase more tokens')
        };
    })

    it('ends token sale', async()=>{
        try {
            await tokenSale.endSale({from: buyer});
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0 , 'must be admin to perform this')
        }

        await tokenSale.endSale({from: admin});
        var amount = await token.balanceOf(admin);
        assert.equal(amount.toNumber(), 9999900, 'return all unused tokens');
        
        // amount = await tokenSale.tokenPrice();
        // assert.equal(amount.toNumber (), 0 , 'token price was reset');
    })
})