import { Request } from "../Helpers/https"

import { createRaribleSdk } from "@rarible/sdk"
import { toOrderId } from "@rarible/types"
// import { EthersEthereum, EthersWeb3ProviderEthereum } from "@rarible/ethers-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { getClient } from "../Helpers/ethers";
// import { ethers } from "ethers"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import Web3 from "web3";
import Env from '@ioc:Adonis/Core/Env'

interface TokenMarketplaceData {
  floorPrice: string | null;
  floorPriceCurrency: string | null;
  saleStatus: 'AVAILABLE' | 'UNAVAILABLE';
  orderId: string | null;
}




// getTokenMarketplaceData() : floor_price, floor_price_currency, sale_status,order_id,
// createPurchase
// completePurchase
// getPurchaseStatus
export default class Rarible {
  private raribleSdk;
  private network;

  constructor(network) {
    const client = this.getWeb3Client(network)
    this.network = network;
    // this.raribleSdk = createRaribleSdk(new Web3Ethereum({ web3: client }), "prod")
  }

  public async getTokenMarketplaceData(collectionAddress, tokenId): Promise<TokenMarketplaceData> {
    try {
      let url = this.getSellByItem(collectionAddress, tokenId)
      let response = await Request.get(url)
      if (!response.ok)
        throw new Error('rarible api unavailable!')
      let data = response.data.data;

      if (data.orders.length < 1)
        throw new Error('No sell orders for token!')

      let floorPrice, floorPriceCurrency, saleStatus, orderId;
      data.orders.forEach(e => {
        if (e.status == 'ACTIVE') {
          saleStatus = 'ACTIVE';
          floorPrice = e.take.value;
          floorPriceCurrency = e.take.type["@type"]
          orderId = e.id;
        }
      });
      if(saleStatus !== 'ACTIVE')
        throw new Error("No active sell orders for token!");

      return { floorPrice, floorPriceCurrency, saleStatus, orderId }

    } catch (error) {
      console.error(error.message)
      return {
        floorPrice: null,
        floorPriceCurrency: null,
        saleStatus: 'UNAVAILABLE',
        orderId: null,
      }
    }

  }

  private getSellByItem(collectionAddress, tokenId) {
    let url;
    switch (this.network) {
      case 'ethereum':
        url = `https://api.rarible.org/v0.1/orders/sell/byItem?itemId=ETHEREUM:${collectionAddress}:${tokenId}`
        break;

      case 'matic':
        url = `https://api.rarible.org/v0.1/orders/sell/byItem?itemId=POLYGON:${collectionAddress}:${tokenId}`
        break;

      default:
        break;
    }
    return url;
  }







  /* public async ethereumWallet(network) {
    const ethersWeb3Provider = getClient(network)
    // const ethersWeb3Provider = new ethers.providers.Web3Provider(provider)
    const ethersProvider = new EthersWeb3ProviderEthereum(ethersWeb3Provider)
    const ethWallet = new EthereumWallet(ethersProvider)
    // console.log({ ethWallet })
    return ethWallet;
  } */

  private getWeb3Client(network) {
    let client
    switch (network) {
      case 'ethereum':
        client = new Web3(Env.get('MAINNET_PROVIDER'));
        break;
      case 'matic':
        client = new Web3(Env.get('MATIC_PROVIDER'));
        break;
      default:
        break;
    }
    return client;
  }



}
