App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    loading: false,
    tokenPrice: 1000000000000000,
    tokensSold: 0,
    tokensAvailable: 750000,
    tokenSaleInstance: null,
    tokenInstance: null,

    init : function() {
        console.log('App init');
        return App.initWeb3();
    },
    initWeb3 : function() {
        if (typeof web3 !== 'undefined') {
            // If a web3 instance is already provided by Meta Mask.
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
          } else {
            // Specify default instance if no web3 instance provided
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
            web3 = new Web3(App.web3Provider);
          }
          return App.initContracts();
    },
    initContracts : function() {
        $.getJSON("PandaTokenSale.json", function(pandaTokenSale) {
            App.contracts.PandaTokenSale = TruffleContract(pandaTokenSale);
            App.contracts.PandaTokenSale.setProvider(App.web3Provider);
            App.contracts.PandaTokenSale.deployed().then(function(pandaTokenSale) {
                console.log("Panda Token Sale Address:", pandaTokenSale.address);
              });
        }).done(function() {
            $.getJSON("PandaToken.json", function(pandaToken) {
                    App.contracts.PandaToken = TruffleContract(pandaToken);
                    App.contracts.PandaToken.setProvider(App.web3Provider);
                    App.contracts.PandaToken.deployed().then(function(pandaToken) {
                    console.log("Panda Token Address:", pandaToken.address);
                })
            });

            App.listenForEvents();
            return App.render();
        });

    },

    render : function() {
        if(App.loading) return;
        App.loading = true;

        var loader  = $('#loader');
        var content = $('#content');
    
        loader.show();
        content.hide();

        // Load account address
        if(web3.currentProvider.enable){
            web3.currentProvider.enable().then(function() {
                web3.eth.getCoinbase(function(err, account) {
                    if(err === null) {
                      App.account = account;
                      $('#accountAddress').html("Your Account: " + account);
                    }
                  })
            })
        }

        // Load token sale contract
        App.contracts.PandaTokenSale.deployed().then(function(instance) {
            App.tokenSaleInstance = instance;
            return App.tokenSaleInstance.tokenPrice();
        }).then(function(tokenPrice) {
            App.tokenPrice = tokenPrice;
            $(".token-price").html(web3.utils.fromWei(App.tokenPrice, "ether"));
            return App.tokenSaleInstance.tokensSold();
        }).then(function(tokensSold) {
            App.tokensSold = tokensSold.toNumber();
            $('.tokens-sold').html(App.tokensSold);
            $('.tokens-available').html(App.tokensAvailable);

            var progresssPercent = (App.tokensSold/App.tokensAvailable)*100;
            $('#progress').css('width', progresssPercent + '%');

            // Load token contract
            App.contracts.PandaToken.deployed().then(function(instance) {
                App.tokenInstance = instance;
                return App.tokenInstance.balanceOf(App.account);
            }).then(function(balance) {
                $('.pnd-balance').html(balance.toNumber());


                App.loading = false;
                loader.hide();
                content.show();
            })
        })
    },

    listenForEvents: function(){
        App.contracts.PandaTokenSale.deployed().then(function(instance) {
            instance.contract.events.Sell({}, {
              fromBlock: 0,
              toBlock: 'latest',
            },function(error, event) {
                console.log("event triggered", event);
                App.render();
              })
          })
    },

    buyTokens: function() {
        $('#content').hide();
        $('#loader').show();
        var numberOfTokens = $('#numberOfTokens').val();
        console.log(numberOfTokens);
        App.contracts.PandaTokenSale.deployed().then(function(instance) {
            return instance.buyTokens(numberOfTokens, {
                from: App.account,
                value: numberOfTokens * App.tokenPrice,
                gas: 500000
            });
        }).then(function(result) {
            console.log("Tokens bought...")
            console.log(result);
            $('form').trigger('reset')
            // App.render();
        })
    }
}

$(function() {
    $(window).on('load', function(){
        App.init();
    })
})