import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import Pool from 'App/Models/Pool';
import { formatErrorMessage } from '../Helpers/utils';
import Database from '@ioc:Adonis/Lucid/Database';
import PoolFundingsController from './PoolFundingsController';
import LoansController from './LoansController';
import { HttpContext } from '@adonisjs/core/build/standalone';

export default class PoolsController {

  public async create({ request, response }: HttpContextContract) {
    try {
      const data = request.body();
      await this.validate(request)


      let pool = await Pool.query()
        .where("contractPoolId", data.contractPoolId)
        .where("network", data.network)
      if (pool.length !== 0)
        throw new Error("pool created for this network previously!");

      let result = await Pool.create({
        contractPoolId: data.contractPoolId,
        creatorId: data.creatorId,
        network: data.network,
        paymentCycle: data.paymentCycle,
        apr: data.apr,
        durationInSecs: data.durationInSecs,
        durationInMonths: data.durationInMonths,
        status: 'OPEN'
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
        .totalFundsInPool(data[0].contract_pool_id)
      data[0].volume = totalAmount

      response.status(200).json({ data });
    } catch (error) {
      response.status(400).json({ data: error.message });
    }
  }


  public async viewActive({
    response, request
  }: HttpContextContract) {
    try {
      let network = request.header('CLIENT-NETWORK')
      if (network === undefined) {
        throw new Error('Attach header `CLIENT-NETWORK`')
      }

      let data = await Database.from("pools")
        .where('status', 'OPEN')
        .where('network', network)

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
    request
  }: HttpContextContract) {
    try {
      let network = request.header('CLIENT-NETWORK')
      if (network === undefined) {
        throw new Error('Attach header `CLIENT-NETWORK`')
      }
      let data = await Database.from("pools")
        .where('creator_id', params.userAddress)
        .where('network', network)

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


  public async totalVolumeInPools({ request }: HttpContextContract) {
    let totalVolume = 0;
    let network = request.header('CLIENT-NETWORK')
    if (network === undefined) {
      return 0
    }
    let pool = await Database.from("pools").where('network', network)

    for (const each of pool) {
      let volumeInPool = await new PoolFundingsController()
        .totalFundsInPool(each.contract_pool_id)
      totalVolume += volumeInPool
    }

    return totalVolume;
  }

  public async totalVolumeAvailableInPools({ request, response, logger, profiler }: HttpContextContract) {
    // total_available = total_vol - total_borrowed
    const httpContext = new HttpContext(request, response, logger, profiler)

    let totalVolume = await this.totalVolumeInPools(httpContext);
    let totalBorrowed = await new LoansController().totalLoansBorrowed(httpContext)
    return totalVolume - totalBorrowed;
  }


  private async validate(request) {
    const Schema = schema.create({
      contractPoolId: schema.string(),
      creatorId: schema.string(),
      network: schema.string(),
      paymentCycle: schema.string(),
      apr: schema.number(),
      durationInSecs: schema.number(),
      durationInMonths: schema.number(),
    })
    await request.validate({ schema: Schema });
  }

}
