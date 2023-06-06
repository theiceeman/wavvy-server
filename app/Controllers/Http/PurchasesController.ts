import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import Purchase from 'App/Models/Purchase';
import { formatErrorMessage } from '../Helpers/utils';
import Database from '@ioc:Adonis/Lucid/Database';
import User from 'App/Models/User';
import AlchemyApi from '../Marketplace/AlchemyApi';
import LoanRepaymentsController from './LoanRepaymentsController';
import LoansController from './LoansController';
import Collection from 'App/Models/Collection';
import OpenSea from '../Marketplace/OpenSea';

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

  // collectionAddress, tokenId
  public async purchaseFromOpensea({ params, response }: HttpContextContract) {
    try {
      const { collectionAddress, tokenId } = params;

      let purchase = await Database.from("purchases")
        .where('token_address', collectionAddress)
        .where('token_id', tokenId)

      if (purchase.length < 1) {
        throw new Error('No purchase created for this token!')
      }

      let result = await new OpenSea(purchase[purchase.length - 1].network)
        .createPurchase(collectionAddress, tokenId);

      if (!result.ok)
        throw new Error('Error purchasing on opensea!')

      response.status(200).json({ data: "Purchase successfull on opensea!" });

    } catch (error) {
      response.status(400).json({ data: await formatErrorMessage(error) })
    }
  }


  public async viewAll({
    response
  }: HttpContextContract) {
    try {
      let data = await Database.from("purchases")


      response.status(200).json({ data });
    } catch (error) {
      response.status(400).json({ data: error.message });
    }
  }



  //  returns: collection_name, token_avatar, user_address, downpayment, principal
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
        let { address: tokenAddress, network: tokenNetwork, name } =
          (await Database.from("collections")
            .where('address', each.token_address)
            .where('network', network))[0]


        let loan = await Database.from("loans")
          .where('contract_loan_id', each.contract_loan_id)

        each.collectionName = name;
        each.tokenAvatar = await new AlchemyApi()
          .getNftTokenAvatar(tokenAddress, each.token_id, tokenNetwork)
        each.principal = loan[0].principal;

      }

      response.status(200).json({ data: purchases });
    } catch (error) {
      response.status(400).json({ data: error.message });
    }
  }


  public async userPurchases({ params, response, request }: HttpContextContract) {
    try {
      const { userId } = params;

      let network = request.header('CLIENT-NETWORK')
      if (network === undefined) {
        throw new Error('Attach header `CLIENT-NETWORK`');
      }

      let user = await User.query()
        .where("unique_id", userId)
      // console.log({user})

      let loans = await Database.from("loans")
        .where("borrower", user[0].walletAddress)
        .where("network", network)

      if (loans.length < 1)
        throw new Error('user has no projects')

      for (let i = 0; i < loans.length; i++) {

        let { tokenAddress, tokenId, network: tokenNetwork } =
          (await Purchase.query()
            .where("contract_loan_id", loans[i].contract_loan_id)
            .where("network", network))[0]

        let collection = await Database.from("collections")
          .where("address", (tokenAddress).toLowerCase())
          .where("network", network)

        let amountRepaid = await new LoanRepaymentsController()
          .amountRepaidByUser(userId, network)

        loans[i].tokenId = tokenId
        loans[i].tokenAvatar = await new AlchemyApi()
          .getNftTokenAvatar(tokenAddress, tokenId, tokenNetwork)

        loans[i].collectionName = collection[0].name
        loans[i].debt = loans[i].principal - amountRepaid;
        loans[i].nextDueDate = await new LoansController()
          .userNextDueDateForPayment(loans[i].contract_loan_id, network)

      };

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
