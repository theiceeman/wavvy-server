import { Request } from "../Helpers/https";
import PoolRegistryStore from "./contracts/PoolRegistryStore";
import Env from '@ioc:Adonis/Core/Env'
import { supportedChains } from "./ethers";

export default class DataIngester {
  private network;

  constructor(network: supportedChains) {
    this.network = network;
  }


  public async poolCreated(poolId: string, creatorId: string) {
    try {
      const pool = await new PoolRegistryStore(this.network).getPoolByID(poolId);
      let data = {
        contractPoolId: poolId,
        creatorId: creatorId,
        network: this.network,
        paymentCycle: Number(pool.paymentCycle).toString(),
        apr: Number(pool.APR),
        durationInSecs: Number(pool.durationInSecs),
        durationInMonths: Number(pool.durationInMonths)
      }

      let res = await Request.post(`${Env.get('APP_SERVER_API')}pools/create`, data)
      if (res.ok) {
        console.log('PoolFunded event ingested.');
        return true
      }
    } catch (error) {
      console.log({ error, msg: 'PoolFunded event ingestion failed!' });

    }

  }

}
