import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import LoanRepayment from "App/Models/LoanRepayment";
import { convertIsoTimestampToDate, convertTimestampInSecsToDate, convertTimestampToSeconds, formatErrorMessage } from "../Helpers/utils";
import Database from '@ioc:Adonis/Lucid/Database';
import PoolRegistry from '../Helpers/contract-methods';
import { supportedChains } from '../Helpers/ethers';

export default class LoanRepaymentsController {

  public async create({ request, response }: HttpContextContract) {
    try {
      const data = request.body();

      let result = await LoanRepayment.create({
        contractLoanId: data.contractLoanId,
        contractPoolId: data.contractPoolId,
        contractLoanRepaymentId: data.contractLoanRepaymentId,
        amount: data.amount,
        type: data.type,
      });

      if (result !== null) {
        response.status(200).json({ data: "Loan Repayment created!" });
      } else {
        throw new Error("Loan Repayment failed!");
      }

    } catch (error) {
      response.status(400).json({ data: await formatErrorMessage(error) })
    }
  }


  public async amountToPay({
    params,
    response,
  }: HttpContextContract) {
    try {
      let loan = await Database.from("loans")
        .where('unique_id', params.loanUniqueId)

      await new PoolRegistry(supportedChains.polygonMumbai)._calcLoanPartPayment('0', '0'); return;



      // response.status(200).json({ data: timeline });
    } catch (error) {
      response.status(400).json({ data: error.message });
    }
  }

  public async timeline({
    params,
    response,
  }: HttpContextContract) {
    try {
      let timeline: Array<string> = [];

      let loan = await Database.from("loans")
        .where('unique_id', params.loanUniqueId)
      timeline.push(convertIsoTimestampToDate(loan[0].created_at))

      let dayPurchasedInSecs = convertTimestampToSeconds(loan[0].created_at)

      let pool = await Database.from("pools")
        .where('contract_pool_id', loan[0].contract_pool_id)

      let paymentInterval = pool[0].duration_in_secs / pool[0].payment_cycle;

      let currentDate = dayPurchasedInSecs;
      for (let i = 0; i < pool[0].payment_cycle; i++) {
        let nextDueDate = currentDate + paymentInterval
        timeline.push(`Due ${convertTimestampInSecsToDate(nextDueDate)}`)
        currentDate = nextDueDate
      }


      response.status(200).json({ data: timeline });
    } catch (error) {
      response.status(400).json({ data: error.message });
    }
  }

}
