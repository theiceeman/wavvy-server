import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AlchemyApi from '../Marketplace/AlchemyApi';
import Database from '@ioc:Adonis/Lucid/Database';
import Rarible from '../Marketplace/Rarible';
import { formatErrorMessage } from '../Helpers/utils';

export default class TokensController {


  // input: collectionAddress, tokenId
  // returns: tokenAvatar, floorPrice, loanPrice, saleStatus, orderId
  public async tokenDetails({ params, response }: HttpContextContract) {
    try {
      const { collectionId, tokenId } = params;

      let res = await Database.from("collections")
        .where('unique_id', collectionId)

      let tokenAvatar = await new AlchemyApi().getNftTokenAvatar(res[0].address, tokenId, res[0].network)

      let { floorPrice, floorPriceCurrency, saleStatus, orderId } = await new Rarible(res[0].network)
        .getTokenMarketplaceData(res[0].address, tokenId)

      let data = {
        tokenAvatar, floorPrice, floorPriceCurrency, saleStatus, orderId
      }

      response.status(200).json({ data });

    } catch (error) {
      response.status(400).json({ data: await formatErrorMessage(error) })
    }
  }

}
