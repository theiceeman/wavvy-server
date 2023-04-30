import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PoolFunding from 'App/Models/PoolFunding';
import { schema } from '@ioc:Adonis/Core/Validator'
import { formatErrorMessage } from '../Helpers/utils';
import Database from '@ioc:Adonis/Lucid/Database';

export default class PoolFundingsController {

  public async create({ request, response }: HttpContextContract) {
    try {
      const data = request.body();
      await this.validate(request)

      let result = await PoolFunding.create({
        contractPoolId: data.contractPoolId,
        amount: data.amount
      });

      if (result !== null) {
        response.status(200).json({ data: "funding created!" });
      } else {
        throw new Error("pool funding failed!");
      }

    } catch (error) {
      response.status(400).json({ data: await formatErrorMessage(error) })
    }
  }

  public async totalFundsInPool(poolId) {
    let amount = 0;
    let data = await Database.from("pool_fundings")
      .where('contract_pool_id', poolId)
    if (data.length < 1)
      return 0

    for (const each of data) {
      amount += each.amount
    }
    return amount;

  }

  private async validate(request) {
    const Schema = schema.create({
      contractPoolId: schema.string(),
      amount: schema.number(),
    })
    await request.validate({ schema: Schema });
  }

}
