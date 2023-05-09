

import { contractAddress, getClient, supportedChains } from "./ethers";
import abiManager from "../../../resources/abi/index"
import { ethers } from "ethers";
import DataIngester from "./DataIngester";
import { getWeb3Socket } from "../Helpers/utils";

/*
repay loan
claim nft

 */

/*
poolCreated
pool funding
purchaseCreated
loanCreated
LoanRepaid
NFTClaimed
purchaseCompleted
 */


export default class Indexer {
  private network;
  private wavvy;
  private _wavvy;
  private poolRegistry;
  private _poolRegistry;

  constructor(network: supportedChains) {
    this.network = network;
    const provider = getClient(network)
    const socket = getWeb3Socket(network)

    this.poolRegistry = new ethers.Contract(contractAddress[network].POOL_REGISTRY, abiManager.PoolRegistryAbi, provider);
    this._wavvy = new ethers.Contract(contractAddress[network].WAVVY, abiManager.WavvyAbi, provider);


    this.wavvy = new socket.eth.Contract(abiManager.WavvyAbi, contractAddress[network].WAVVY)
    this._poolRegistry = new socket.eth.Contract(abiManager.PoolRegistryAbi, contractAddress[network].POOL_REGISTRY)
  }




  public async ethersListeners() {
    console.log(`listening on ${this.network}...`)

    this.poolRegistry.on('PoolCreated', async (_from, _to, value) => {
      let { args } = value
      await new DataIngester(this.network)
        .poolCreated(String(args[0]), args[1])
    });

    this.poolRegistry.on('PoolFunded', async (_from, _to, value) => {
      let { args } = value
      await new DataIngester(this.network)
        .poolFunded(String(args[0]), args[1].toString(10))
    });

  }


  public async web3Listeners() {

    this.wavvy.events.PurchaseCreated(async (_err, events) => {
      let { userAddress, purchaseId, downPayment } = events.returnValues;
      await new DataIngester(this.network)
        .purchaseCreated(userAddress, purchaseId, downPayment)
    })

    this._poolRegistry.events.LoanCreated(async (_err, events) => {
      let { loanId, borrower, principal } = events.returnValues;
      await new DataIngester(this.network)
        .loanCreated(loanId, borrower, principal)
    })

    this.wavvy.events.PurchaseCompleted(async (_err, events) => {
      let { purchaseId } = events.returnValues;
      await new DataIngester(this.network)
        .purchaseCompleted(purchaseId)
    })

  }


  public async _web3Listeners() {
    this.wavvy.events.LoanRepaid(async (_err, events) => {
      let { loanRepaymentId, loanId, amount } = events.returnValues;
      await new DataIngester(this.network)
        .loanRepaid(loanRepaymentId, loanId, amount, events.returnValues['3'])
    })

  }


  public async __web3Listeners() {
    this.wavvy.events.NFTClaimed(async (_err, events) => {
      let { purchaseId, claimer } = events.returnValues;
      await new DataIngester(this.network)
        .nftClaimed(purchaseId, claimer)
    })

  }





  // public async test() {

  //   // Get all events emitted by the contract
  //   const filter = {
  //     address: contractAddress[this.network].WAVVY
  //   };
  //   const events = await this._wavvy.queryFilter(filter);
  //   console.log(events);
  // }


}
