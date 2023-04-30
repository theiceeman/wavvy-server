import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import Pool from 'App/Models/Pool';
import { formatErrorMessage } from '../Helpers/utils';
import Database from '@ioc:Adonis/Lucid/Database';
import PoolFundingsController from './PoolFundingsController';
import LoansController from './LoansController';

export default class PoolsController {

  public async create({ request, response }: HttpContextContract) {
    try {
      const data = request.body();
      await this.validate(request)

      let result = await Pool.create({
        contractPoolId: data.poolId,
        creatorId: data.creatorId,
        // amount: data.amount,
        paymentCycle: data.paymentCycle,
        apr: data.apr,
        durationInSecs: data.durationInSecs,
        durationInMonths: data.durationInMonths,
        status: 'open'
      });

      if (result !== null) {
        response.status(200).json({ data: "Pool created!" });
      } else {
        throw new Error("Pool creation failed!");
      }

    } catch (error) {
      response.status(400).json({ data: await formatErrorMessage(error) })
    }
  }




  public async single({
    params,
    response,
  }: HttpContextContract) {
    try {
      let data = await Database.from("pools")
        .where('unique_id', params.uniqueId)

      let totalAmount = await new PoolFundingsController()
        .totalFundsInPool(data[0].pool_id)
      data[0].volume = totalAmount

      response.status(200).json({ data });
    } catch (error) {
      response.status(400).json({ data: error.message });
    }
  }


  public async view({
    response,
  }: HttpContextContract) {
    try {
      let data = await Database.from("pools")
        .where('status', 'open')

      for (const each of data) {
        let totalAmount = await new PoolFundingsController()
          .totalFundsInPool(each.contract_pool_id)
        each.volume = totalAmount
      }

      response.status(200).json({ data });
    } catch (error) {
      response.status(400).json({ data: error.message });
    }
  }


  public async user({
    params,
    response,
  }: HttpContextContract) {
    try {
      let data = await Database.from("pools")
        .where('creator_id', params.userAddress)

      for (const each of data) {
        let totalAmount = await new PoolFundingsController()
          .totalFundsInPool(each.contract_pool_id)
        each.volume = totalAmount
      }

      response.status(200).json({ data });
    } catch (error) {
      response.status(400).json({ data: error.message });
    }
  }


  public async status({ params, response }: HttpContextContract) {
    try {
      const { uniqueId } = params;
      let pool = await Pool.query()
        .where("unique_id", uniqueId)
      if (pool.length < 1)
        throw new Error("pool doesnt exist!");


      let status = pool[0].status == 'open' ? 'closed' : 'open';
      let result = await Pool
        .query()
        .where("unique_id", uniqueId)
        .update({ status })

      if (result !== null) {
        response.status(200).json({ data: "status updated!" });
      } else {
        throw new Error("status update failed!");
      }

    } catch (error) {
      response.status(400).json({ data: await formatErrorMessage(error) })
    }
  }


  public async totalVolumeInPools() {
    let totalVolume = 0;
    let pool = await Database.from("pools")

    for (const each of pool) {
      let volumeInPool = await new PoolFundingsController()
        .totalFundsInPool(each.contract_pool_id)
      totalVolume += volumeInPool
    }

    return totalVolume;
  }

  public async totalVolumeAvailableInPools() {
    // total_available = total_vol - total_borrowed
    let totalVolume = await this.totalVolumeInPools();
    let totalBorrowed = await new LoansController().totalLoansBorrowed()
    return totalVolume - totalBorrowed;
  }


  private async validate(request) {
    const Schema = schema.create({
      poolId: schema.string(),
      creatorId: schema.string(),
      // amount: schema.number(),
      paymentCycle: schema.string(),
      apr: schema.number(),
      durationInSecs: schema.number(),
      durationInMonths: schema.number(),
    })
    await request.validate({ schema: Schema });
  }

}