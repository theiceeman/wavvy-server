import PoolRegistryStore from "./contracts/PoolRegistryStore";
import { supportedChains } from "./ethers";
import { formatEther } from "ethers";
import WavvyStore from "./contracts/WavvyStore";
import Purchase from "App/Models/Purchase";
import Loan from "App/Models/Loan";
import Pool from "App/Models/Pool";
import PoolFunding from "App/Models/PoolFunding";
import LoanRepayment from "App/Models/LoanRepayment";

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
        durationInMonths: Number(pool.durationInMonths),
        status: pool.status == 0 ? 'OPEN' : 'CLOSED'
      }
      // console.log({data})

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
        status: 'OPEN'
      }

      let result = await Purchase.create(data)
      if (result !== null) console.log('PurchaseCreated event ingested.');

    } catch (error) {
      console.log({ error, msg: 'PurchaseCreated event ingestion failed!' });
    }
  }


  public async loanCreated(loanId: string, poolId: string, borrower: string, principal: string) {
    try {

      let data = {
        network: this.network,
        contractLoanId: loanId,
        contractPoolId: poolId,
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

  public async loanRepaid(loanRepaymentId: string, loanId: string, amount: string, type: string) {
    try {

      let data = {
        contractLoanId: loanId,
        contractLoanRepaymentId: loanRepaymentId,
        amount: Number(formatEther(amount)),
        type: type == '0' ? 'full' : 'part'
      }
      let result = await LoanRepayment.create(data)

      // check loan status, if closed update loan status
      // let loan = new PoolRegistryStore(this.network).getLoanByPoolID()

      // if (type == '0') {

      //   let data = {
      //     status: 'closed'
      //   }

      //   let result = await Loan
      //     .query()
      //     .where("contract_loan_id", loanId)
      //     .update({ data })
      // }

      if (result !== null) console.log('LoanRepaid event ingested.');

    } catch (error) {
      console.log({ error, msg: 'LoanRepaid event ingestion failed!' });
    }
  }

  public async nftClaimed(purchaseId: string, claimer: string) {
    try {
      let data = {
        status: 'CLAIMED'
      }

      let result = await Purchase
        .query()
        .where("contract_purchase_id", purchaseId)
        .where("user_address", claimer)
        .update(data)
      if (result !== null) console.log('NftClaimed event ingested.');

    } catch (error) {
      console.log({ error, msg: 'NftClaimed event ingestion failed!' });
    }
  }

  // emit PurchaseCompleted(purchaseId);
  public async purchaseCompleted(purchaseId: string) {
    try {
      let result = await Purchase
        .query()
        .where("contract_purchase_id", purchaseId)

      let purchase = await new WavvyStore(this.network).getPurchaseByID(result[0].userAddress, purchaseId)

      let data = {
        status: 'COMPLETED',
        escrowAddress: purchase.escrowAddress
      }

      await Purchase
        .query()
        .where("contract_purchase_id", purchaseId)
        .update(data)
      if (result !== null) console.log('PurchaseCompleted event ingested.');

    } catch (error) {
      console.log({ error, msg: 'PurchaseCompleted event ingestion failed!' });
    }
  }

}
