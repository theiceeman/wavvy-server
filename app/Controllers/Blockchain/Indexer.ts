

import { getClient } from "./ethers";
import abiManager from "../../../resources/abi/index"
import { ethers } from "ethers";
import DataIngester from "./DataIngester";
import { getWeb3Socket } from "../Helpers/utils";
import Env from '@ioc:Adonis/Core/Env'
import { contractAddress, supportedChains } from "../types";
import OpenSea from "../Marketplace/OpenSea";
import WavvyStore from "./contracts/WavvyStore";

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
  private poolRegistry;
  private _poolRegistry;

  constructor(network: supportedChains) {
    this.network = network;
    const provider = getClient(network)
    const socket = getWeb3Socket(network)

    const wallet = new ethers.Wallet(Env.get('WAVVY_PRIVATE_KEY'), provider);
    this.poolRegistry = new ethers.Contract(contractAddress[network].POOL_REGISTRY, abiManager.PoolRegistryAbi, wallet);

    this.wavvy = new socket.eth.Contract(abiManager.WavvyAbi, contractAddress[network].WAVVY)
    this._poolRegistry = new socket.eth.Contract(abiManager.PoolRegistryAbi, contractAddress[network].POOL_REGISTRY)
  }


  public async streamPastEvents() {
    await this._poolRegistry.getPastEvents('PoolCreated', { fromBlock: 0 }, (_error, events) => {
      // console.log(`listening on ${this.network} for PoolCreated...`)
      events?.forEach(async e => {
        let { poolId, creator } = e.returnValues;
        await new DataIngester(this.network)
          .poolCreated(poolId, creator)
      });
    });


    await this._poolRegistry.getPastEvents('PoolFunded', { fromBlock: 0 }, (_error, events) => {
      // console.log(`listening on ${this.network} for PoolFunded...`)
      events.forEach(async e => {
        let { poolId, amount } = e.returnValues;
        await new DataIngester(this.network)
          .poolFunded(poolId, amount)
      });
    });


    await this.wavvy.getPastEvents('PurchaseCreated', { fromBlock: 0 }, (_error, events) => {
      // console.log(`listening on ${this.network} for PurchaseCreated...`)
      events.forEach(async e => {
        let { userAddress, purchaseId, downPayment } = e.returnValues;
        await new DataIngester(this.network)
          .purchaseCreated(userAddress, purchaseId, downPayment)
      });
    });



    await this._poolRegistry.getPastEvents('LoanCreated', { fromBlock: 0 }, (_error, events) => {
      events.forEach(async e => {
        let { loanId, poolId, borrower, principal } = e.returnValues;
        await new DataIngester(this.network)
          .loanCreated(loanId, poolId, borrower, principal)
      });

    });


    await this.wavvy.getPastEvents('PurchaseCompleted', { fromBlock: 0 }, (_error, events) => {
      events.forEach(async e => {
        let { purchaseId } = e.returnValues;
        await new DataIngester(this.network)
          .purchaseCompleted(purchaseId);
      });
    });


    await this.wavvy.getPastEvents('LoanRepaid', { fromBlock: 0 }, (_error, events) => {
      events.forEach(async e => {
        let { loanRepaymentId, loanId, amount } = e.returnValues;
        await new DataIngester(this.network)
          .loanRepaid(loanRepaymentId, loanId, amount, e.returnValues['3'])
      });
    });


    await this.wavvy.getPastEvents('NFTClaimed', { fromBlock: 0 }, (_error, events) => {
      events.forEach(async e => {
        let { purchaseId, claimer } = e.returnValues;
        await new DataIngester(this.network)
          .nftClaimed(purchaseId, claimer)
      });
    });

  }


  public async ethersListeners() {
    console.log(`listening on ${this.network} for PoolCreated & PoolFunded...`)

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


  public async PurchaseCreated() {
    console.log(`listening on ${this.network} for PurchaseCreated...`)
    this.wavvy.events.PurchaseCreated(async (_err, events) => {
      console.log('found!')

      let { userAddress, purchaseId, downPayment } = events.returnValues;
      await new DataIngester(this.network)
        .purchaseCreated(userAddress, purchaseId, downPayment)
    })


  }


  public async LoanCreatedListener() {
    console.log(`listening on ${this.network} for LoanCreated...`)
    this._poolRegistry.events.LoanCreated(async (_err, events) => {
      let { loanId, poolId, borrower, principal } = events.returnValues;
      await new DataIngester(this.network)
        .loanCreated(loanId, poolId, borrower, principal)
    })

  }


  public async PurchaseCompletedListener() {
    console.log(`listening on ${this.network} for PurchaseCompleted...`)
    this.wavvy.events.PurchaseCompleted(async (_err, events) => {
      let { purchaseId } = events.returnValues;
      await new DataIngester(this.network)
        .purchaseCompleted(purchaseId)
    })
  }


  public async LoanRepaid() {
    console.log(`listening on ${this.network} for LoanRepaid...`)
    this.wavvy.events.LoanRepaid(async (_err, events) => {
      let { loanRepaymentId, loanId, amount } = events.returnValues;
      await new DataIngester(this.network)
        .loanRepaid(loanRepaymentId, loanId, amount, events.returnValues['3'])
    })

  }


  public async NFTClaimed() {
    console.log(`listening on ${this.network} for NftClaimed...`)
    this.wavvy.events.NFTClaimed(async (_err, events) => {
      let { purchaseId, claimer } = events.returnValues;
      await new DataIngester(this.network)
        .nftClaimed(purchaseId, claimer)
    })

  }

}
