import PoolRegistryStore from "./contracts/PoolRegistryStore";
import { supportedChains } from "./ethers";
import { formatEther } from "ethers";
import WavvyStore from "./contracts/WavvyStore";
import Purchase from "App/Models/Purchase";
import Loan from "App/Models/Loan";
import Pool from "App/Models/Pool";
import PoolFunding from "App/Models/PoolFunding";

export default class DataIngester {
  private network: supportedChains;

  constructor(network: supportedChains) {
    this.network = network;
  }


  public async poolCreated(poolId: string, creatorId: string) {
    try {
      const pool = await new PoolRegistryStore(this.network).getPoolByID(poolId);
      let data = {
        contractPoolId: poolId,
        creatorId: creatorId,
        network: this.network,
        paymentCycle: Number(pool.paymentCycle).toString(),
        apr: Number(pool.APR),
        durationInSecs: Number(pool.durationInSecs),
        durationInMonths: Number(pool.durationInMonths)
      }

      let result = await Pool.create(data)
      if (result !== null) console.log('PoolCreated event ingested.');

    } catch (error) {
      console.log({ error, msg: 'PoolCreated event ingestion failed!' });
    }
  }


  public async poolFunded(poolId: string, amount: string) {
    try {

      let data = {
        network: this.network,
        contractPoolId: poolId,
        amount: Number(formatEther(amount)),
      }
      let result = await PoolFunding.create(data)
      if (result !== null) console.log('PoolFunded event ingested.');

    } catch (error) {
      console.log({ error, msg: 'PoolFunded event ingestion failed!' });
    }
  }



  public async purchaseCreated(userAddress: string, purchaseId: string, downPayment: string) {
    try {
      const purchase = await new WavvyStore(this.network).getPurchaseByID(userAddress, purchaseId);

      let data = {
        network: this.network,
        userAddress,
        contractPurchaseId: purchaseId,
        contractPoolId: String(purchase.poolId),
        contractLoanId: String(purchase.loanId),
        escrowAddress: purchase.escrowAddress,
        tokenAddress: purchase.tokenAddress,
        tokenId: String(purchase.tokenId),
        downPayment,
        status: 'pending'
      }

      let result = await Purchase.create(data)
      if (result !== null) console.log('PurchaseCreated event ingested.');

    } catch (error) {
      console.log({ error, msg: 'PurchaseCreated event ingestion failed!' });
    }
  }


  public async loanCreated(loanId: string, borrower: string, principal: string) {
    try {

      let data = {
        network: this.network,
        contractLoanId: loanId,
        borrower: borrower,
        principal: formatEther(principal),
        status: 'open'
      }
      let result = await Loan.create(data)
      if (result !== null) console.log('LoanCreated event ingested.');

    } catch (error) {
      console.log({ error, msg: 'LoanCreated event ingestion failed!' });
    }
  }

}
