import Web3 from 'web3'
import { OpenSeaAPI, Network, OpenSeaSDK } from 'opensea-js'
import Env from '@ioc:Adonis/Core/Env'
import { OpenSeaAsset } from 'opensea-js/lib/types';
import { formatErrorMessage, getRpcUrl } from '../Helpers/utils';
import { Collection, contractAddress, supportedChains } from '../types';
import { Request } from '../Helpers/https';
import { OrderV2 } from 'opensea-js/lib/orders/types';
import { parseEther } from 'ethers/lib/utils';
import { ItemType } from '@opensea/seaport-js/lib/constants';



export default class OpenSea {
  private openSeaApi;
  private openSeaSdk;
  private provider;
  private network;

  constructor(network: supportedChains) {
    this.provider = new Web3.providers.HttpProvider(getRpcUrl(supportedChains.ethereum))
    this.network = network;

    this.openSeaApi = new OpenSeaAPI({
      networkName: network == 'ethereum' ? Network.Main : Network.Goerli,
      apiKey: Env.get('OPENSEA_API_KEY')
    })

    this.openSeaSdk = new OpenSeaSDK(this.provider, {
      networkName: network == 'ethereum' ? Network.Main : Network.Goerli,
      apiKey: Env.get('OPENSEA_API_KEY')
    })
  }


  public async getCollectionDetails(tokenAddress, tokenId): Promise<Collection> {
    const asset: OpenSeaAsset = await this.openSeaApi.getAsset({
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
        floorPrice = (token.collection.stats.seven_day_average_price).toFixed(2)
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


  public async createPurchase(collectionAddress: any, tokenId: any) {
    try {
      const _order = await this.openSeaApi.getOrders({
        assetContractAddress: collectionAddress,
        tokenIds: [tokenId],
        side: "ask"
      })

      if (_order.orders.length < 1) {
        throw new Error('Token is not available for purchase!')
      }

      const order: OrderV2 = _order.orders[0]
      // return order;
      const accountAddress: string = Env.get('WAVVY_WALLET')

      const transactionHash = await this.openSeaSdk.fulfillOrder({ order, accountAddress })
      return { ok: true, data: transactionHash }
    } catch (error) {
      return { ok: false, data: await formatErrorMessage(error) };
    }

  }

  public async _createPurchase(collectionAddress: any, tokenId: any) {

    let order = {
      offer: [
        {
          itemType: ItemType.ERC721,
          token: collectionAddress,
          identifier: tokenId,
        },
      ],
      consideration: [
        {
          amount: parseEther("10").toString(),
          recipient: offerer.address,
          token: contractAddress[this.network].ERC20_TOKEN
        },
      ],
      // 2.5% fee
      fees: [{ recipient: zone.address, basisPoints: 250 }],
    };

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

  private async getTokenListing(collectionAddress, tokenId) {
    let url = `https://api.opensea.io/v2/orders/ethereum/seaport/listings?asset_contract_address=${collectionAddress}&token_ids=${tokenId}&order_by=created_date&order_direction=desc`

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
