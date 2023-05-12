import PoolRegistryStore from "./contracts/PoolRegistryStore";
import Database from "@ioc:Adonis/Lucid/Database";
import WavvyStore from "./contracts/WavvyStore";
import Purchase from "App/Models/Purchase";
import Loan from "App/Models/Loan";
import Pool from "App/Models/Pool";
import PoolFunding from "App/Models/PoolFunding";
import LoanRepayment from "App/Models/LoanRepayment";
import { supportedChains } from "./ethers";
import { utils } from "ethers";

export default class DataIngester {
  private network: supportedChains;

  constructor(network: supportedChains) {
    this.network = network;
  }


  public async poolCreated(poolId: string, creatorId: string) {
    try {

      let res = await Database.from("pools")
        .where('contract_pool_id', poolId)
        .where('network', this.network)
      if (res.length >= 1) return


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
      let res = await Database.from("pool_fundings")
        .where('contract_pool_id', poolId)
        .where('network', this.network)
      if (res.length >= 1) return

      let data = {
        network: this.network,
        contractPoolId: poolId,
        amount: Number(utils.formatEther(amount)),
      }
      let result = await PoolFunding.create(data)
      if (result !== null) console.log('PoolFunded event ingested.');

    } catch (error) {
      console.log({ error, msg: 'PoolFunded event ingestion failed!' });
    }
  }



  public async purchaseCreated(userAddress: string, purchaseId: string, downPayment: string) {
    try {
      let res = await Database.from("purchases")
        .where('contract_purchase_id', purchaseId)
        .where('network', this.network)
      if (res.length >= 1) return

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
        downPayment: utils.formatEther(downPayment),
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
      let res = await Database.from("loans")
        .where('contract_loan_id', loanId)
        .where('network', this.network)
      if (res.length >= 1) return


      let data = {
        network: this.network,
        contractLoanId: loanId,
        contractPoolId: poolId,
        borrower: borrower,
        principal: utils.formatEther(principal),
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
      let res = await Database.from("loan_repayments")
        .where('contract_loan_repayment_id', loanRepaymentId)
        .where('network', this.network)
      if (res.length >= 1) return

      let data = {
        network: this.network,
        contractLoanId: loanId,
        contractLoanRepaymentId: loanRepaymentId,
        amount: Number(utils.formatEther(amount)),
        type: type == '0' ? 'full' : 'part'
      }
      let result = await LoanRepayment.create(data)

      // check loan status, if closed update loan status
      let loan = await Loan.query()
        .where("contract_loan_id", loanId)
        .where('network', this.network)
      if (loan.length < 1) return;

      let loanDetails = await new PoolRegistryStore(this.network)
        .getLoanByPoolID(loan[0].contractPoolId, loanId)

      if (loanDetails?.status == 1) {
        let data = {
          status: 'closed'
        }

        await Loan.query()
          .where("contract_loan_id", loanId)
          .where('network', this.network)
          .update(data)
      }

      if (result !== null) console.log('LoanRepaid event ingested.');

    } catch (error) {
      console.log({ error, msg: 'LoanRepaid event ingestion failed!' });
    }
  }

  public async nftClaimed(purchaseId: string, claimer: string) {
    try {
      let res = await Database.from("purchases")
        .where('contract_purchase_id', purchaseId)
        .where('network', this.network)
        .where('status', 'CLAIMED')
      if (res.length >= 1) return

      let data = {
        status: 'CLAIMED'
      }

      let result = await Purchase
        .query()
        .where("contract_purchase_id", purchaseId)
        .where('network', this.network)
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
      let res = await Database.from("purchases")
        .where('contract_purchase_id', purchaseId)
        .where('network', this.network)
        .where('status', 'COMPLETED')

      if (res.length > 1) {
        return
      }

      let result = await Purchase.query()
        .where("contract_purchase_id", purchaseId)
        .where('network', this.network)
      if (result.length < 1) {
        return;
      }

      let purchase = await new WavvyStore(this.network).getPurchaseByID(result[0].userAddress, purchaseId)

      let data = {
        status: 'COMPLETED',
        escrowAddress: purchase.escrowAddress
      }

      await Purchase.query()
        .where("contract_purchase_id", purchaseId)
        .where('network', this.network)
        .update(data)
      if (result !== null) console.log('PurchaseCompleted event ingested.');

    } catch (error) {
      console.log({ error, msg: 'PurchaseCompleted event ingestion failed!' });
    }
  }

}
