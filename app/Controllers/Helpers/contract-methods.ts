import { ethers } from "ethers";
import { getClient, contractAddress } from "./ethers";
import abiManager from "../../../resources/abi/index"

export default class PoolRegistry {
  private provider;
  private poolRegistryAddress;

  constructor(network) {
    this.provider = getClient(network);
    console.log({ provider: this.provider })
    this.poolRegistryAddress = contractAddress[network].POOL_REGISTRY
  }

  public async _calcLoanPartPayment(loanId, poolId) {
    const contract = new ethers.Contract(this.poolRegistryAddress, abiManager.PoolRegistryAbi, this.provider);
    const data = await contract._calcLoanPartPayment(loanId, poolId);

    console.log({ xxx: 'xxx', data });

  }

}
