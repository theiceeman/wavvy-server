import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import Purchase from 'App/Models/Purchase';
import { formatErrorMessage } from '../Helpers/utils';
import Database from '@ioc:Adonis/Lucid/Database';
import User from 'App/Models/User';
import AlchemyApi from '../Marketplace/AlchemyApi';
import LoanRepaymentsController from './LoanRepaymentsController';
import LoansController from './LoansController';
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

      // check if purchase has been made already on opensea
      if(purchase[purchase.length - 1].status == 'COMPLETED'){
        response.status(200).json({ data: "Purchase successfull on opensea!" });
        return;
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

      let data: Array<Object> = [];
      let purchases = await Database.from("purchases")
        .where('network', network)
      purchases.reverse()

      for (const [index, each] of purchases.entries()) {
        if (index < 9) {
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

          data.push(each)

        }
      }

      response.status(200).json({ data });
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
      if (user.length < 1) {
        response.status(200).json({ data: [] });
        return;
      }

      let loans = await Database.from("loans")
        .where("borrower", user[0].walletAddress)
        .where("network", network)

      loans.reverse()

      if (loans.length < 1) {
        response.status(200).json({ data: [] });
        return;
      }

      for (let i = 0; i < loans.length; i++) {

        let { tokenAddress, tokenId, network: tokenNetwork, status: purchaseStatus, contractPurchaseId } =
          (await Purchase.query()
            .where("contract_loan_id", loans[i].contract_loan_id)
            .where("network", network))[0]

        let collection = await Database.from("collections")
          .where("address", (tokenAddress).toLowerCase())
          .where("network", network)

        let amountRepaid = await new LoanRepaymentsController()
          .amountRepaidByUser(loans[i].contract_loan_id, network)

        loans[i].tokenId = tokenId
        loans[i].tokenAvatar = await new AlchemyApi()
          .getNftTokenAvatar(tokenAddress, tokenId, tokenNetwork)

        loans[i].collectionAddress = collection[0].address
        loans[i].collectionName = collection[0].name
        loans[i].debt = loans[i].principal - amountRepaid;
        loans[i].nextDueDate = await new LoansController()
          .userNextDueDateForPayment(loans[i].contract_loan_id, network)
        loans[i].purchaseStatus = purchaseStatus
        loans[i].contractPurchaseId = contractPurchaseId

      };

      response.status(200).json({ data: loans });

    } catch (error) {
      response.status(400).json({ data: await formatErrorMessage(error) })
    }
  }


  public async singlePurchase({ params, response, request }: HttpContextContract) {
    try {
      const { loanId } = params;

      let network = request.header('CLIENT-NETWORK')
      if (network === undefined) {
        throw new Error('Attach header `CLIENT-NETWORK`');
      }

      let loans = await Database.from("loans")
        .where("unique_id", loanId)
        .where("network", network)

      if (loans.length < 1) {
        response.status(200).json({ data: [] });
        return;
      }

      // for (let i = 0; i < loans.length; i++) {

      let { tokenAddress, tokenId, network: tokenNetwork } =
        (await Purchase.query()
          .where("contract_loan_id", loans[0].contract_loan_id)
          .where("network", network))[0]

      let collection = await Database.from("collections")
        .where("address", (tokenAddress).toLowerCase())
        .where("network", network)

      let amountRepaid = await new LoanRepaymentsController()
        .amountRepaidByUser(loans[0].contract_loan_id, network)

      loans[0].tokenId = tokenId
      loans[0].tokenAvatar = await new AlchemyApi()
        .getNftTokenAvatar(tokenAddress, tokenId, tokenNetwork)

      loans[0].collectionName = collection[0].name
      loans[0].description = collection[0].description
      loans[0].debt = loans[0].principal - amountRepaid;
      loans[0].nextDueDate = await new LoansController()
        .userNextDueDateForPayment(loans[0].contract_loan_id, network)

      // };

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
