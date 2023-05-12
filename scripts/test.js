/* const Web3 = require('web3');
// const { abi } = require('./resources/abi/Wavvy.json')
const { abi } = require('./resources/abi/PoolRegistry.json')

const web3 = new Web3(new Web3.providers.WebsocketProvider('wss://polygon-mumbai.g.alchemy.com/v2/oe21CCNseQJ_m_HTQ0Y09671I-CGvbxt'));

// const contract = new web3.eth.Contract(abi, '0xCbA0894ae944DF4AcFFa60822b495Dbb0D90637a')
const contract = new web3.eth.Contract(abi, '0x221786808B9d68e6752BBeBC5cf92D4FfE8A8D6C')

// contract.events.PurchaseCreated()
//   .on('data', event => {
//     console.log(event);
//   })
//   .on('error', error => {
//     console.error(error);
//   });
// console.log('listening...')
// contract.events.LoanRepaid((err, events) => {
//   console.log(err, events)
// })
contract.getPastEvents('allEvents', {
  fromBlock: 0,
  toBlock: 'latest'
}, function(error, events){
  console.log(events);
});

// contract.getPastEvents('LoanCreated', {
//   fromBlock: 0,
//   toBlock: 'latest'
// }, (error, events) => {
//   console.log(events); // an array of all events matching the search criteria
// });
 */

const { ethers } = require("ethers");
const { abi } = require('../resources/abi/PoolRegistry.json')


  async function x(){
  const provider = new ethers.providers.JsonRpcProvider('https://polygon-mumbai.g.alchemy.com/v2/oe21CCNseQJ_m_HTQ0Y09671I-CGvbxt')
  const wallet = new ethers.Wallet('80f509081f636decfb0b7510489c158355369baf3a86a9e773ce7d9110971a24', provider);
  const poolRegistry = new ethers.Contract('0x221786808B9d68e6752BBeBC5cf92D4FfE8A8D6C', abi, wallet);


  const filter = {
    address: '0x221786808B9d68e6752BBeBC5cf92D4FfE8A8D6C'
  };
  // console.log({ contract: poolRegistry });return;
  const events = await poolRegistry.queryFilter(filter);
  console.log(events);
}
 x()
