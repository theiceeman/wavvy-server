

import { contractAddress, getClient, supportedChains } from "./ethers";
import abiManager from "../../../resources/abi/index"
import { ethers } from "ethers";
import DataIngester from "./DataIngester";

/*
poolCreated
pool funding
purchaseCreated
loanCreated
payment made
 */


export default class Indexer {
  private mumbaiWavvy;
  private mumbaiPoolRegistry;

  constructor() {
    const mumbaiProvider = getClient(supportedChains.polygonMumbai)

    this.mumbaiWavvy = new ethers.Contract(contractAddress.polygonMumbai.WAVVY, abiManager.WavvyAbi, mumbaiProvider);
    this.mumbaiPoolRegistry = new ethers.Contract(contractAddress.polygonMumbai.POOL_REGISTRY, abiManager.PoolRegistryAbi, mumbaiProvider);
  }

  public async listen() {
    await this.mumbai()
  }

  private async mumbai() {
    console.log('listening on Mumbai...')

    // ingest poolCreated event
    this.mumbaiPoolRegistry.on('PoolCreated', async (from, to, value) => {
      let { args } = value
      await new DataIngester(supportedChains.polygonMumbai).poolCreated(String(args[0]), args[1])
    });
  }

  public async test() {
    await new DataIngester(supportedChains.polygonMumbai).poolCreated('7', '0x10B3fA7Fc49e45CAe6d32A113731A917C4F1755a')
  }





  private async IngestPoolCreated() {

  }

}
