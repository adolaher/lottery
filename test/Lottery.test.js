const assert = require('assert'); //helper library from node standard
const ganache = require('ganache-cli'); // sets up local test network
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());//provider allows us to connect to network

const { abi, evm } = require('../compile'); //abi/evm instead of interface bytecode

let lottery;
let accounts;

beforeEach(async () => {
  //assign value to account variable ->web3 eth module -> get accounts
  accounts = await web3.eth.getAccounts();
  //deploy instance of lottery contract -> pass in abi
  lottery = await new web3.eth.Contract(abi)
  //deploy statement takes bytecode
  .deploy({ data: evm.bytecode.object })
  //send to test network, specify account used for deployment + gas
  .send({ from: accounts[0], gas: '1000000' });
});

 describe('Lottery Contract', () => {
   it('deploys a contract', () => {
     assert.ok(lottery.options.address);
   });
   it('allows for entrance to the lottery', async () => {
     await lottery.methods.enter().send({
       from: accounts[0],
       value: web3.utils.toWei('0.02', 'ether')
     });
     const players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    });
    assert.equal(accounts[0], players[0]);
    assert.equal(1, players.length)
  });

  it('allows for entrance of multiple accounts to the lottery', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.02', 'ether')
    });
    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('0.02', 'ether')
    });
    await lottery.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei('0.02', 'ether')
    });

    const players = await lottery.methods.getPlayers().call({
     from: accounts[0]
    });
    assert.equal(accounts[0], players[0]);
    assert.equal(accounts[1], players[1]);
    assert.equal(accounts[2], players[2]);
    assert.equal(3, players.length)
  });

  it('requires a minimum amount of ether to enter', async () => {
    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: 0
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });
  it('only manager can call pickwinner', async() => {
    try{
      await lottery.methods.pickWinner().send({
        from: accounts[1]
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it('send money to the winner and resets player array', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('2', 'ether')
    })
    const initialBalance = await web3.eth.getBalance(accounts[0]);
    await lottery.methods.pickWinner().send({ from: accounts[0]});
    const finalBalance = await web3.eth.getBalance(accounts[0]);
    const difference = finalBalance - initialBalance;
    
    assert(difference > web3.utils.toWei('1.8', 'ether'));
  });
});
