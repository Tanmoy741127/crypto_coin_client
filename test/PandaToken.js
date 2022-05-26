var PandaToken = artifacts.require("./PandaToken.sol");

contract('PandaToken', function(accounts){
    let token

    before(async()=>{
        token = await PandaToken.deployed()
    })

    describe('deployment', async()=>{
        it('sets name and symbol for token', async()=>{
            const name = await token.name();
            const symbol = await token.symbol();
            assert.equal(name, "Panda Token", 'name sets to Panda Token');
            assert.equal(symbol, "PND", 'symbol sets to PND')
        })

        it('sets the total supply upon deployment', async()=>{
            const totalSupply = await token.totalSupply()
            assert.equal(totalSupply, '10000000','sets total supply to 10mn')

            const adminBalance = await token.balanceOf(accounts[0]);
            assert.equal(adminBalance, '10000000','admin balance set to 10mn')
        })
    })

    describe('normal transfer', async()=>{
        it('transfer token', async()=>{
            try {
                const result = await token.transfer(accounts[1], 9999999999 , {from : accounts[0]});
            } catch (error) {
                assert(error.message.indexOf('revert') >= 0, 'error message must contain revert')
            }

            let result =  await token.transfer.call(accounts[1], 250000, {from : accounts[0]}); // call method doesn't write in blockchain
            assert.equal(result, true, 'transfer should return true'); 

            result =  await token.transfer(accounts[1], 250000, {from : accounts[0]});

            // Check logs
            const event = result.logs[0].args;
            assert.equal(event._from, accounts[0], 'account tokens transferred from');
            assert.equal(event._to, accounts[1], 'account tokens transferred to');
            assert.equal(event._value, 250000, 'transfer amount');
            var balanceFrom = await token.balanceOf(accounts[0]);
            assert.equal(balanceFrom.toNumber(), 9750000, 'deducts amount from sending account');
            var balanceTo = await token.balanceOf(accounts[1]);
            assert.equal(balanceTo.toNumber(), 250000, 'adds amount to receiving account');
        })
    })

    describe('delegated transfer', async()=>{
        it('approves tokens', async()=>{
            let result = await token.approve.call(accounts[1], 100);
            assert.equal(result, true, 'approve return true'); 

            result =  await token.approve(accounts[1], 100);
            // Check logs
            const event = result.logs[0].args;
            assert.equal(event._owner, accounts[0], 'account tokens authorized by');
            assert.equal(event._spender, accounts[1], 'account tokens authorized to');
            assert.equal(event._value, 100, 'transfer amount');

            result = await token.allowance(accounts[0], accounts[1]);
            assert.equal(result.toNumber(), 100, 'stores allowance for delegated transfer');
        })

        it('handles transfers', async()=>{
            const fromAccount = accounts[2];
            const toAccount = accounts[3];
            const spendingAccount = accounts[4];
            // Transfer some tokens to fromAccount
            await token.transfer(fromAccount, 100, {from: accounts[0]});

            await token.approve(spendingAccount, 10, {from : fromAccount});

            try {
                await token.transferFrom(fromAccount, toAccount, 9999 , {from: spendingAccount});
            } catch (error) {
                assert(error.message.indexOf('revert') >= 0 , 'cannot transfer value larger than balance')
            }


            try {
                await token.transferFrom(fromAccount, toAccount, 20 , {from: spendingAccount});
            } catch (error) {
                assert(error.message.indexOf('revert') >= 0 , 'cannot transfer value larger than approved amount')
            }

            let result =  await token.transferFrom.call(fromAccount, toAccount, 10, {from : spendingAccount}); // call method doesn't write in blockchain
            assert.equal(result, true, 'transferfrom should return true'); 

            result = await token.transferFrom(fromAccount, toAccount, 10 , {from: spendingAccount});
            const event = result.logs[0].args;
            assert.equal(event._from, fromAccount, 'tokens transferred from');
            assert.equal(event._to, toAccount, 'tokens transferred to');
            assert.equal(event._value, 10, 'transfer amount');
            var balanceFrom = await token.balanceOf(fromAccount);
            assert.equal(balanceFrom.toNumber(), 90, 'deducts amount from sending account')
            var balanceTo = await token.balanceOf(toAccount);
            assert.equal(balanceTo.toNumber(), 10, 'adds amount to receivingg account')

            result = await token.allowance(fromAccount, spendingAccount);
            assert.equal(result.toNumber(), 0, 'deducts amount from the allowance')


        })
    })

})