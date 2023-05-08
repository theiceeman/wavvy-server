

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

    this.poolRegistry = new ethers.Contract(contractAddress[network].POOL_REGISTRY, abiManager.PoolRegistryAbi, provider);
    this.wavvy = new socket.eth.Contract(abiManager.WavvyAbi, contractAddress[network].WAVVY)
    this._poolRegistry = new socket.eth.Contract(abiManager.PoolRegistryAbi, contractAddress[network].POOL_REGISTRY)
  }


  public async listen() {
    console.log(`listening on ${this.network}...`)

    // await this.web3Listeners()
    await this.ethersListeners()

  }


  private async ethersListeners() {

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
  }




  public async test() {

    // 2n, '0x10B3fA7Fc49e45CAe6d32A113731A917C4F1755a'
    // await new DataIngester(this.network).poolCreated(String(2n), '0x10B3fA7Fc49e45CAe6d32A113731A917C4F1755a')
    // await new DataIngester(this.network).poolFunded(String(10n), (85000000000000000000n).toString(10))
    await new DataIngester(supportedChains.polygonMumbai).purchaseCreated('0x10B3fA7Fc49e45CAe6d32A113731A917C4F1755a', '1', '20000000000000000000')
  }


}
