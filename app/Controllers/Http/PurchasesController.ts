import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import Purchase from 'App/Models/Purchase';
import { formatErrorMessage } from '../Helpers/utils';
// import Rarible from '../Marketplace/Rarible';
import Database from '@ioc:Adonis/Lucid/Database';

export default class PurchasesController {

  public async create({ request, response }: HttpContextContract) {
    try {
      const data = request.body();
      await this.validate(request)
      let network = (((data.orderId).split(':'))[0]).toLowerCase()


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
