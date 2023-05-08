import { ethers, formatEther } from "ethers";
import { getClient, contractAddress } from "../ethers";
import abiManager from "../../../../resources/abi/index"

export default class PoolRegistry {
  private provider;
  private poolRegistryAddress;
  private contract;

  constructor(network) {
    this.provider = getClient(network);
    this.poolRegistryAddress = contractAddress[network].POOL_REGISTRY
    this.contract = new ethers.Contract(this.poolRegistryAddress, abiManager.PoolRegistryAbi, this.provider);
  }

  public async _calcLoanPartPayment(loanId, poolId) {
    const data = await this.contract._calcLoanPartPayment(loanId, poolId);
    return Number(formatEther(data)).toFixed(5)
  }

  public async _calcLoanFullPayment(loanId, poolId) {
    const data = await this.contract._calcLoanFullPayment(loanId, poolId);
    return formatEther(data.toString(10));
  }

}
