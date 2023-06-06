
import { Collection, seaportAddress, supportedChains } from '../types';
import { formatErrorMessage, getRpcUrl } from '../Helpers/utils';
import { OpenSeaAPI, Network, OpenSeaSDK } from 'opensea-js'
import { OpenSeaAsset } from 'opensea-js/lib/types';
import { OrderV2 } from 'opensea-js/lib/orders/types';
import { getClient } from '../Blockchain/ethers';
import { Seaport } from '@opensea/seaport-js';
import { Request } from '../Helpers/https';
import { BigNumber, ethers } from 'ethers';
import Env from '@ioc:Adonis/Core/Env'
import Web3 from 'web3'
import { formatEther, parseEther } from 'ethers/lib/utils';



export default class OpenSea {
  private openSeaApi;
  private openSeaSdk;
  private provider;
  private network;

  constructor(network: supportedChains) {
    this.provider = new Web3.providers.HttpProvider(getRpcUrl(network))
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
    // const asset: OpenSeaAsset = await this.openSeaApi.getAsset({
    //   tokenAddress,
    //   tokenId
    // })
    // console.log({asset})
    // let collection = asset.collection

    let apiAsset = await this.getCollectionAsset(tokenAddress);
    console.log({ apiAsset })

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
      const listings = await this.getTokenListing(collectionAddress, tokenId);
      const order = listings.orders[0]

      let floorPriceCurrency, floorPrice, saleStatus;
      floorPriceCurrency = this.network == 'matic' ? 'MATIC' : 'ETHER'


      if (listings.orders.length < 1) {
        saleStatus = 'UNAVAILABLE'
        floorPrice = null
      } else {
        saleStatus = 'AVAILABLE'
        floorPrice = formatEther(BigNumber.from(order.current_price))
      }
      return { tokenId, floorPrice, floorPriceCurrency, saleStatus, loanPrice: floorPrice / 2 }

    } catch (error) {
      console.log('getTokenMarketplaceData', { error })
      return {
        tokenId,
        floorPrice: null,
        floorPriceCurrency: null,
        saleStatus: 'UNAVAILABLE',
        loanPrice: null,
      }
    }
  }


  // public async createPurchase(collectionAddress: any, tokenId: any) {
  //   try {
  //     const _order = await this.openSeaApi.getOrders({
  //       assetContractAddress: collectionAddress,
  //       tokenIds: [tokenId],
  //       side: "ask"
  //     })

  //     if (_order.orders.length < 1) {
  //       throw new Error('Token is not available for purchase!')
  //     }

  //     const order: OrderV2 = _order.orders[0]
  //     const accountAddress: string = Env.get('WAVVY_WALLET')

  //     const transactionHash = await this.openSeaSdk.fulfillOrder({ order, accountAddress })
  //     return { ok: true, data: transactionHash }
  //   } catch (error) {
  //     return { ok: false, data: await formatErrorMessage(error) };
  //   }

  // }

  public async createPurchase(collectionAddress: any, tokenId: any) {
    try {
      const provider = await getClient(this.network)
      const listings = await this.getTokenListing(collectionAddress, tokenId);
      const order = listings.orders[0]
      let { fulfillment_data } = await this.getFulfillmentData(order.order_hash, order.protocol_address);

      const OPENSEA_DOMAIN = "opensea.io";
      const seaport = new Seaport(provider, {
        overrides: {
          contractAddress: seaportAddress.matic,
        },
        seaportVersion: "1.5",
      });

      const { actions } = await seaport.fulfillOrder({
        order: fulfillment_data.orders[0],
        accountAddress: Env.get('WAVVY_WALLET'),
        domain: OPENSEA_DOMAIN,
      });

      const wallet = new ethers.Wallet(Env.get('WAVVY_PRIVATE_KEY'), provider);
      const approvalAction = actions[0];

      const transaction = await approvalAction.transactionMethods.buildTransaction()
      // console.log({ order, transaction, value: formatEther(BigNumber.from(transaction.value)) }); return;

      const gasEstimate = await provider.estimateGas(transaction);
      transaction.gasLimit = gasEstimate;
      transaction.gasPrice = BigNumber.from(135000000000);

      let res = await wallet.sendTransaction(transaction)
      if (!res.hash)
        throw new Error('purchase failed on opensea!')

      console.log({ hash: res.hash })
      return { ok: true, data: res.hash }

      // return { ok: true, data: transaction}

    } catch (error) {
      console.log({ error })
      return { ok: false, data: await formatErrorMessage(error) };
    }
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
    try {
      let url = `https://api.opensea.io/api/v1/asset/${collectionAddress}/${tokenId}/?include_orders=true`

      let config = {
        headers: {
          "X-API-KEY": Env.get('OPENSEA_API_KEY'),
        }
      }

      let response = await Request.get(url, config)
      // console.log({ url, response })
      if (!response.ok) {
        throw new Error('opensea api unavailable!')
      }
      return response.data.data;
    } catch (error) {
      console.log({ error })
    }
  }

  /*
  curl --request GET \
     --url 'https://api.opensea.io/v2/orders/matic/seaport/listings?asset_contract_address=0x2f058542658fdb1254ce599953a7aff7a4e925a4&token_ids=7261&order_by=created_date&order_direction=desc' \
     --header 'X-API-KEY: d1f0236b140345a9a02d30c07add9a36' \
     --header 'accept: application/json'
   */

  private async getTokenListing(collectionAddress, tokenId) {
    let url = `https://api.opensea.io/v2/orders/${this.network}/seaport/listings?asset_contract_address=${collectionAddress}&token_ids=${tokenId}&order_by=created_date&order_direction=desc`

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

  private async getFulfillmentData(orderHash, protocolAddress) {
    let url = `https://api.opensea.io/v2/listings/fulfillment_data`;

    let data = {
      "listing": {
        "hash": orderHash,
        "chain": this.network,
        "protocol_address": protocolAddress
      },
      "fulfiller": {
        "address": "0x10B3fA7Fc49e45CAe6d32A113731A917C4F1755a"
      }
    }

    let config = {
      headers: {
        "X-API-KEY": Env.get('OPENSEA_API_KEY'),
      }
    }

    let response = await Request.post(url, data, config)
    if (!response.ok)
      throw new Error('opensea api unavailable!')
    return response.data.data;
  }

}




