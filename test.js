const Web3 = require('web3');
const { abi } = require('./resources/abi/Wavvy.json')

const web3 = new Web3(new Web3.providers.WebsocketProvider('wss://polygon-mumbai.g.alchemy.com/v2/oe21CCNseQJ_m_HTQ0Y09671I-CGvbxt'));

const contract = new web3.eth.Contract(abi, '0xDeee23398Bb90727a2122b4EcB61d55aD6467B33')

// contract.events.PurchaseCreated()
//   .on('data', event => {
//     console.log(event);
//   })
//   .on('error', error => {
//     console.error(error);
//   });
console.log('listening...')
contract.events.PurchaseCreated((err, events) => {
  console.log(err, events)
})
