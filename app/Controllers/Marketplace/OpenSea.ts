import Web3 from 'web3'
import { OpenSeaAPI, Network } from 'opensea-js'
import Env from '@ioc:Adonis/Core/Env'
import { OpenSeaAsset } from 'opensea-js/lib/types';
import { getRpcUrl } from '../Helpers/utils';
import { Collection, supportedChains } from '../types';



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

    return {
      name: collection.name,
      description: collection.description,
      avatar: collection.featuredImageUrl,
      // @ts-ignore
      owner: collection.owner,
      // @ts-ignore
      items: collection.stats.total_supply,
      // @ts-ignore
      totalVolume: collection.stats.total_volume,
      // @ts-ignore
      floorPrice: collection.stats.floor_price,
      website: collection.externalLink,
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


}
