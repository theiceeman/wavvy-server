import { ethers } from "ethers";
import { getClient, contractAddress, supportedChains } from "../ethers";
import abiManager from "../../../../resources/abi/index";

type PoolDetails = {
  amount: number,
  paymentCycle: number,
  APR: number,
  durationInSecs: number,
  durationInMonths: number,
  creator: number,
  status: number, //  OPEN | CLOSED
  isExists: boolean
}


type LoanDetails = {
  poolId: number,
  borrower: string,
  principal: number,
  createdAtTimestamp: number,
  status: number, //  OPEN | CLOSED
  isExists: boolean;
}

export default class PoolRegistryStore {
  private provider;
  private contractAddress;
  private contract;

  constructor(network: supportedChains) {
    this.provider = getClient(network);
    this.contractAddress = contractAddress[network].POOL_REGISTRY_STORE
    this.contract = new ethers.Contract(this.contractAddress, abiManager.PoolRegistryAbi, this.provider);
  }


  public async getLoanByPoolID(loanId, poolId): Promise<LoanDetails> {
    const data = await this.contract.getLoanByPoolID(loanId, poolId);
    // console.log(data)
    return data
  }


  public async getPoolByID(poolId): Promise<PoolDetails> {
    const data = await this.contract.getPoolByID(poolId);
    // console.log(data)
    return data
  }


}
