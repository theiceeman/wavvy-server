import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import Database from "@ioc:Adonis/Lucid/Database";
// import Rarible from '../Marketplace/Rarible';
import Loan from 'App/Models/Loan';
import { convertIsoTimestampToDate, convertTimestampInSecsToDate, convertTimestampToSeconds, formatErrorMessage } from '../Helpers/utils';
import OpenSea from '../Marketplace/OpenSea';

export default class LoansController {


  public async create({ request, response }: HttpContextContract) {
    try {
      const data = request.body();
      await this.validate(request)

      let result = await Loan.create({
        network: data.network,
        contractLoanId: data.contractLoanId,
        borrower: data.borrower,
        principal: data.principal,
      });

      if (result !== null) {
        response.status(200).json({ data: "Loan created!" });
      } else {
        throw new Error("Loan creation failed!");
      }

    } catch (error) {
      response.status(400).json({ data: await formatErrorMessage(error) })
    }
  }


  public async viewAll({
    response
  }: HttpContextContract) {
    try {
      let data = await Database.from("loans")


      response.status(200).json({ data });
    } catch (error) {
      response.status(400).json({ data: error.message });
    }
  }

  public async loanTerms({ params, response }: HttpContextContract) {
    try {
      let collection = await Database.from("collections")
        .where('unique_id', params.collectionUniqueId)

      let pool = await Database.from("pools")
        .where('unique_id', params.poolUniqueId)

      if (collection[0].network !== pool[0].network) {
        throw new Error('collection and pool are not on same chain!')
      }

      let { floorPrice } = await new OpenSea(collection[0].network)
        .getTokenMarketplaceData(collection[0].address, params.tokenId)

      // nb: in our project, downpayment(initial amount paid) is equal to the principal(amount borrowed).
      let downPaymentAmount = Number(floorPrice) / 2;
      let monthlyPayments = await this.partPaymentWithoutDefault(downPaymentAmount, params.poolUniqueId);
      let totalPurchaseAmount = downPaymentAmount + (monthlyPayments * Number(pool[0].payment_cycle))

      let data = {
        originalPurchasePrice: floorPrice,
        interestFee: 0,
        downPaymentAmount,
        monthlyPayments,
        totalPurchaseAmount
      }

      response.status(200).json({ data });
    } catch (error) {
      response.status(400).json({ data: error.message });
    }
  }



  public async totalLoansBorrowed({ request }: HttpContextContract) {
    let volumeBorrowed = 0;
    let network = request.header('CLIENT-NETWORK')
    if (network === undefined) {
      return 0
    }
    let loans = await Database.from("loans").where('network', network)

    for (const each of loans) {
      volumeBorrowed += Number(each.principal)
    }

    return volumeBorrowed
  }

  public async totalLoansFundedByPool(contractPoolId) {
    let data = await Database.from("loans")
      .where('contract_pool_id', contractPoolId)
    return data.length;

  }


  private async partPaymentWithoutDefault(
    principal,
    uniqueId
  ): Promise<number> {
    let pool = await Database.from("pools")
      .where('unique_id', uniqueId)

    let interest = (principal * pool[0].apr) / 100;
    return (principal + interest) / pool[0].payment_cycle;
  }


  public async userNextDueDateForPayment(
    contractLoanId,
    network
  ) {
    let repayments = await Database.from("loan_repayments")
      .where('contract_loan_id', contractLoanId)
      .where('network', network)
    let countRepayments = repayments.length;


    let timeline: Array<string> = [];

    let loan = await Database.from("loans")
      .where('contract_loan_id', contractLoanId)
      .where('network', network)

    timeline.push(convertIsoTimestampToDate(loan[0].created_at))

    let dayPurchasedInSecs = convertTimestampToSeconds(loan[0].created_at)

    let pool = await Database.from("pools")
      .where('contract_pool_id', loan[0].contract_pool_id)

    let paymentInterval = pool[0].duration_in_secs / pool[0].payment_cycle;

    let currentDate = dayPurchasedInSecs;
    for (let i = 0; i < pool[0].payment_cycle; i++) {
      let nextDueDate = currentDate + paymentInterval
      timeline.push(convertTimestampInSecsToDate(nextDueDate))
      currentDate = nextDueDate
    }

    return timeline[countRepayments + 1]


  }


  private async validate(request) {
    const Schema = schema.create({
      contractLoanId: schema.string(),
      contractPoolId: schema.string(),
      borrower: schema.string(),
      principal: schema.string(),
    })
    await request.validate({ schema: Schema });
  }



}
