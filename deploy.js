require('dotenv').config()
const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3')
// const {interface, bytecode} = require('./compile');
const {abi, evm} = require('./compile');


const provider = new HDWalletProvider(
  process.env.MNEUMONIC_PHRASE
  'https://rinkeby.infura.io/v3/ac644ddf4c1145c79e6c4fd564e5a60e'
);

const web3 = new Web3(provider);

const deploy = async () => {
  accounts = await web3.eth.getAccounts();

  console.log('Attempting to deploy from account', accounts[0]);

  const result = await new web3.eth.Contract(JSON.parse(abi))
  .deploy({ data: evm.bytecode.object })
  .send({ gas: '1000000', from accounts[0] });

  console.log(JSON.stringify(abi));
  console.log('Contract deployed', result.options.address);
  provider.engine.stop()
};
deploy();
