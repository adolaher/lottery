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
 });
