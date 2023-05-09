import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import { formatErrorMessage } from '../Helpers/utils';
// import Rarible from '../Marketplace/Rarible';
import AlchemyApi from '../Marketplace/AlchemyApi';
import Collection from 'App/Models/Collection';
import Database from '@ioc:Adonis/Lucid/Database';

export default class CollectionsController {

  // address, network[ethereum, polygon], marketplace[rarible, opensea, blur],
  public async create({ request, response }: HttpContextContract) {
    try {
      const data = request.body();
      await this.validate(request)

      let collection = await new AlchemyApi()
        .getCollectionDetails(data.address, data.network)

      let result = await Collection.create({
        address: data.address,
        network: data.network,
        name: collection.name,
        description: collection.description,
        avatar: collection.avatar,
        owner: 'zzz',
        noOfItems: collection.items,
        totalVolume: 'zzz',
        floorPrice: collection.floorPrice,
        website: collection.website,
        status: 'active'
      });

      if (result !== null) {
        response.status(200).json({ data: "Collection created!" });
      } else {
        throw new Error("Collection creation failed!");
      }

    } catch (error) {
      response.status(400).json({ data: await formatErrorMessage(error) })
    }
  }

  public async status({ params, response }: HttpContextContract) {
    try {
      const { id } = params;
      let collection = await Collection.query()
        .where("unique_id", id)

      let status = collection[0].status == 'active' ? 'disabled' : 'active';
      let result = await Collection
        .query()
        .where("unique_id", id)
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

  public async view({
    response, request
  }: HttpContextContract) {
    try {
      let network = request.header('CLIENT-NETWORK')
      if (network === undefined) {
        throw new Error('Attach header `CLIENT-NETWORK`')
      }

      let data = await Database.from("collections")
        .where('status', 'active')
        .where('network', network)

      response.status(200).json({ data });
    } catch (error) {
      response.status(400).json({ data: error.message });
    }
  }


  private async validate(request) {
    const Schema = schema.create({
      address: schema.string(),
      network: schema.string(),
    })
    await request.validate({ schema: Schema });
  }

}
