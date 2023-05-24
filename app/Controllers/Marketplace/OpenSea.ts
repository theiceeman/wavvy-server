import Web3 from 'web3'
import { OpenSeaAPI, Network } from 'opensea-js'
import Env from '@ioc:Adonis/Core/Env'
import { OpenSeaAsset } from 'opensea-js/lib/types';
import { getRpcUrl } from '../Helpers/utils';
import { Collection, supportedChains } from '../types';
import { Request } from '../Helpers/https';



export default class OpenSea {
  private openSeaSdk;

  constructor(network: supportedChains) {
    const provider = new Web3.providers.HttpProvider(getRpcUrl(supportedChains.ethereum))
    this.openSeaSdk = new OpenSeaAPI({
      networkName: Network.Main,
      apiKey: Env.get('OPENSEA_API_KEY')
    })
  }


  public async getCollectionDetails(tokenAddress, tokenId): Promise<Collection> {
    const asset: OpenSeaAsset = await this.openSeaSdk.getAsset({
      tokenAddress,
      tokenId
    })
    let collection = asset.collection

    let apiAsset = await this.getCollectionAsset(tokenAddress);

    return {
      name: collection.name,
      description: collection.description,
      avatar: collection.featuredImageUrl,
      bannerImageUrl: apiAsset.assets[0].collection.banner_image_url,
      // @ts-ignore
      owner: collection.owner,
      // @ts-ignore
      items: collection.stats.total_supply,
      // @ts-ignore
      totalVolume: (collection.stats.total_volume).toFixed(2),
      // @ts-ignore
      floorPrice: (collection.stats.seven_day_average_price).toFixed(2),
      website: collection.externalLink,
    }
  }

  public async getTokenMarketplaceData(collectionAddress, tokenId) {
    try {
      let token = await this.getCollectionToken(collectionAddress, tokenId);
      let floorPriceCurrency = 'WETH', floorPrice, saleStatus;

      if (token.orders === null && token.seaport_sell_orders === null) {
        saleStatus = 'UNAVAILABLE'
        floorPrice = token.collection.stats.seven_day_average_price
      } else {
        saleStatus = 'AVAILABLE'
        floorPrice = token.seaport_sell_orders[0].current_price / 10 ** 18;
      }

      return { tokenId, floorPrice, floorPriceCurrency, saleStatus }

    } catch (error) {
      console.log(error.message)
      return {
        tokenId,
        floorPrice: null,
        floorPriceCurrency: null,
        saleStatus: 'UNAVAILABLE',
      }
    }
  }

  public async getTokensForSale(tokenAddress) {
    const { orders } = await this.openSeaSdk.getOrders({
      asset_contract_address: tokenAddress,
      side: 'ask',
      order_by: 'created_date',
      order_direction: 'desc'
    });
    return orders[0]
    const nftsForSale = orders.map((order) => {
      return {
        tokenId: order.asset.token_id,
        assetContractAddress: order.asset.asset_contract.address,
        seller: order.maker.address,
        price: order.current_price,
        paymentToken: order.payment_token.symbol
      };
    });

    console.dir({
      nftsForSale
    })
  }

  public async createPurchase() {
    // const order = await this.openSeaSdk.api.getOrder({ side: "ask", ... })
    // const accountAddress = Env.get('WAVVY_WALLET') // The buyer's wallet address, also the taker
    // const transactionHash = await this.openSeaSdk.fulfillOrder({ order, accountAddress })

  }

  private async getCollectionAsset(collectionAddress) {
    let url = `https://api.opensea.io/api/v1/assets?order_direction=desc&asset_contract_address=${collectionAddress}&limit=20&include_orders=true`

    let config = {
      headers: {
        "X-API-KEY": Env.get('OPENSEA_API_KEY'),
      }
    }

    let response = await Request.get(url, config)
    if (!response.ok)
      throw new Error('opensea api unavailable!')
    return response.data.data;
  }

  private async getCollectionToken(collectionAddress, tokenId) {
    let url = `https://api.opensea.io/api/v1/asset/${collectionAddress}/${tokenId}/?include_orders=true`

    let config = {
      headers: {
        "X-API-KEY": Env.get('OPENSEA_API_KEY'),
      }
    }

    let response = await Request.get(url, config)
    if (!response.ok)
      throw new Error('opensea api unavailable!')
    return response.data.data;
  }


}
