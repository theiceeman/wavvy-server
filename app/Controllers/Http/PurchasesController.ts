import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import Purchase from 'App/Models/Purchase';
import { formatErrorMessage } from '../Helpers/utils';
import Database from '@ioc:Adonis/Lucid/Database';
import User from 'App/Models/User';
import AlchemyApi from '../Marketplace/AlchemyApi';
import LoanRepaymentsController from './LoanRepaymentsController';
import LoansController from './LoansController';

export default class PurchasesController {

  public async create({ request, response }: HttpContextContract) {
    try {
      const data = request.body();
      await this.validate(request)


      // let res = await new Rarible(network).createPurchase(data.orderId)

      let result = await Purchase.create({
        // orderId: data.orderId,
        network: data.network,
        contractPurchaseId: data.contractPurchaseId,
        contractPoolId: data.contractPoolId,
        status: 'pending'
      });

      if (result !== null) {
        response.status(200).json({ data: "Purchase created!" });
      } else {
        throw new Error("Purchase creation failed!");
      }

    } catch (error) {
      response.status(400).json({ data: await formatErrorMessage(error) })
    }
  }

  /*
    {
      collection_name:
      token_avatar:
      user_address:
      downpayment:
      principal:
    }
  */
  public async recent({
    response, request
  }: HttpContextContract) {
    try {
      let network = request.header('CLIENT-NETWORK')
      if (network === undefined) {
        throw new Error('Attach header `CLIENT-NETWORK`')
      }

      let purchases = await Database.from("purchases")
        .where('network', network)

      for (const each of purchases) {
        let { tokenAddress, tokenId, network: tokenNetwork, name } =
          (await Database.from("collections")
            .where('address', each.tokenAddress)
            .where('network', network))[0]

        let loan = await Database.from("loans")
          .where('contract_loan_id', purchases[0].contractLoanId)

        each.collectionName = name;
        each.tokenAvatar = await new AlchemyApi()
          .getNftTokenAvatar(tokenAddress, tokenId, tokenNetwork)
        each.prinicpal = loan[0].principal;

      }

      response.status(200).json({ data: purchases });
    } catch (error) {
      response.status(400).json({ data: error.message });
    }
  }


  // returns: loan_id, token_avatar, token_id, collection_name, principal_remaining, next_due_date
  public async userPurchases({ params, response, request }: HttpContextContract) {
    try {
      const { userId } = params;

      let network = request.header('CLIENT-NETWORK')
      if (network === undefined) {
        throw new Error('Attach header `CLIENT-NETWORK`');
      }

      let user = await User.query()
        .where("unique_id", userId)

      let loans = await Database.from("loans")
        .where("borrower", user[0].walletAddress)
        .where("network", network)

      if (loans.length < 1)
        throw new Error('user has no projects')

      for (let i = 0; i < loans.length; i++) {

        let { tokenAddress, tokenId, network: tokenNetwork } = (await Purchase.query()
          .where("contract_loan_id", loans[0].contract_loan_id)
          .where("network", network))[0]

        let collection = await Database.from("collections")
          .where("address", tokenAddress)
          .where("network", network)

        let amountRepaid = await new LoanRepaymentsController()
          .amountRepaidByUser(userId, network)

        loans[i].tokenId = tokenId
        loans[i].tokenAvatar = await new AlchemyApi()
          .getNftTokenAvatar(tokenAddress, tokenId, tokenNetwork)
        loans[i].collectionName = collection[0].name
        loans[i].debt = loans[i].principal - amountRepaid;
        loans[i].nextDueDate = await new LoansController()
          .userNextDueDateForPayment(loans[0].contract_loan_id, network)

      };

      // return loans
      response.status(200).json({ data: loans });

    } catch (error) {
      response.status(400).json({ data: await formatErrorMessage(error) })
    }
  }

  async totalLoansByPool(poolUniqueId) {
    let pool = await Database.from("pools")
      .where('unique_id', poolUniqueId)

    let purchases = await Database.from("purchases")
      .where('contract_pool_id', pool[0].contract_pool_id)

    return purchases.length;

  }


  private async validate(request) {
    const Schema = schema.create({
      orderId: schema.string(),
      contractPurchaseId: schema.string(),
    })
    await request.validate({ schema: Schema });
  }


}
