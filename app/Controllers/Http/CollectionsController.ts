import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import { formatErrorMessage } from '../Helpers/utils';
import AlchemyApi from '../Marketplace/AlchemyApi';
import Collection from 'App/Models/Collection';
import Database from '@ioc:Adonis/Lucid/Database';
// import Rarible from '../Marketplace/Rarible';
import OpenSea from '../Marketplace/OpenSea';

export default class CollectionsController {

  public async create({ request, response }: HttpContextContract) {
    try {
      const data = request.body();
      await this.validate(request)

      let res = await Database.from("collections")
        .where('address', data.address)
        .where('network', data.network)
      if (res.length > 0) {
        throw new Error('Collection added previously!')
      }

      let collection = await new OpenSea(data.network)
        .getCollectionDetails(data.address, '1')

      let result = await Collection.create({
        address: data.address,
        network: data.network,
        name: collection.name,
        description: collection.description,
        avatar: collection.avatar,
        bannerImageUrl: collection.bannerImageUrl,
        owner: collection.owner,
        noOfItems: collection.items,
        totalVolume: collection.totalVolume,
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

  public async single({
    params,
    response,
  }: HttpContextContract) {
    try {
      let data = await Database.from("collections")
        .where('unique_id', params.collectionId)

      data[0].collections = await this.collectionTokens(data[0].address, data[0].network)

      response.status(200).json({ data });
    } catch (error) {
      response.status(400).json({ data: error.message });
    }
  }

  public async collectionTokens(address, network): Promise<any> {
    try {
      let collection: Array<Object> = []
      for (let i = 0; i < 5; i++) {
        const tokenId = Math.floor(Math.random() * (20 - 0 + 1)) + 0;
        let tokenAvatar = await new AlchemyApi().getNftTokenAvatar(address, String(tokenId), network)

        let { floorPrice, floorPriceCurrency, saleStatus } = await new OpenSea(network)
          .getTokenMarketplaceData(address, tokenId)

        collection.push({
          tokenId, tokenAvatar, floorPrice, floorPriceCurrency, saleStatus
        })
      }
      return collection;
    } catch (error) {
      console.log({ error })
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
    response
  }: HttpContextContract) {
    try {
      let data = await Database.from("collections")
        .where('status', 'active')

      for (let i = 0; i < data.length; i++) {
        let collection = await this.collectionTokens(data[i].address, data[i].network)
        data[i].collections = collection;
      };

      response.status(200).json({ data });
    } catch (error) {
      response.status(400).json({ data: error.message });
    }
  }

  public async viewAll({
    response
  }: HttpContextContract) {
    try {
      let data = await Database.from("collections")


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
