import { ethers } from "ethers";
import { getClient } from "../ethers";
import abiManager from "../../../../resources/abi/index";
import { contractAddress, supportedChains } from "App/Controllers/types";



type PurchaseDetails = {
  loanId: number,
  poolId: number,
  escrowAddress: string,
  tokenAddress: string,
  tokenId: number,
  status: string,
  isExists: Boolean,
}

export default class WavvyStore {
  private provider;
  private contractAddress;
  private contract;

  constructor(network: supportedChains) {
    this.provider = getClient(network);
    this.contractAddress = contractAddress[network].WAVVY_STORE
    this.contract = new ethers.Contract(this.contractAddress, abiManager.WavvyStoreAbi, this.provider);
  }

  public async getPurchaseByID(borrowerAddress, purchaseId): Promise<PurchaseDetails> {
    const data = await this.contract.getPurchaseByID(borrowerAddress, purchaseId);
    return data
  }




}
