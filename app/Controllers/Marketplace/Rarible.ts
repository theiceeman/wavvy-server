import { Request } from "../Helpers/https"
import HDWalletProvider from "@truffle/hdwallet-provider"
import { createRaribleSdk } from "@rarible/sdk"
import { toOrderId } from "@rarible/types"
// import { EthersEthereum, EthersWeb3ProviderEthereum } from "@rarible/ethers-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { getClient } from "../Blockchain/ethers";
// import { ethers } from "ethers"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import Web3 from "web3";
import Env from '@ioc:Adonis/Core/Env'
import { getRpcUrl } from "../Helpers/utils"

// const { JSDOM } = require('jsdom');
import { JSDOM } from 'jsdom'
const { window } = new JSDOM();
global.window = window;
global.document = window.document;

interface TokenMarketplaceData {
  tokenId: string;
  floorPrice: string | null;
  floorPriceCurrency: string | null;
  saleStatus: 'AVAILABLE' | 'UNAVAILABLE';
  orderId: string | null;
}




// getTokenMarketplaceData() : floor_price, floor_price_currency, sale_status,order_id,
// createPurchase(orderid):
// completePurchase
// getPurchaseStatus
export default class Rarible {
  private raribleSdk;
  private network;
  private environment;  // prod || dev

  constructor(network) {
    this.network = network;
    this.environment = Env.get('NODE_ENV') == 'development' ? 'dev' : 'prod'
    this.raribleSdk = createRaribleSdk(this.ethereumWallet(network), 'development')
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
          saleStatus = 'AVAILABLE';
          floorPrice = e.take.value;
          floorPriceCurrency = e.take.type["@type"]
          orderId = e.id;
        }
      });
      if (saleStatus !== 'AVAILABLE')
        throw new Error("No active sell orders for token!");

      return { tokenId, floorPrice, floorPriceCurrency, saleStatus, orderId }

    } catch (error) {
      console.log(error.message)
      return {
        tokenId,
        floorPrice: null,
        floorPriceCurrency: null,
        saleStatus: 'UNAVAILABLE',
        orderId: null,
      }
    }

  }


  public async createPurchase(orderId) {
    // const order = await this.raribleSdk.apis.order.getOrderByHash({ hash: orderId })

    // // Get order info
    // // const buy = await this.raribleSdk.order.buy.prepare({
    // //   orderId: toOrderId(orderId)
    // // })

    const tx = await this.raribleSdk.order.buy({
      orderId: toOrderId(orderId),
      amount: 1,
    })
    await tx.wait()
    console.log({ tx });

    const buy = await this.raribleSdk.order.buy.prepare({ orderId: toOrderId(orderId) })

    console.log({ buy }); return;

    const result = await buy.submit(1)    //amount of NFTs you want to buy

    console.log({ result })
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







  public ethereumWallet(network) {
    const client = getRpcUrl(network)
    const provider = new HDWalletProvider({
      url: client,
      privateKeys: [Env.get('WAVVY_PRIVATE_KEY')],
      chainId: 1,
    })
    const web3 = new Web3(provider)
    const web3Ethereum = new Web3Ethereum({ web3 })
    return new EthereumWallet(web3Ethereum)
  }

  private getWeb3Client(network) {
    let client
    switch (network) {
      case 'ethereum':
        client = new Web3(Env.get('MAINNET_PROVIDER'));
        break;
      case 'matic':
        client = new Web3(Env.get('MATIC_PROVIDER'));
        break;
      case 'mumbai':
        client = new Web3(Env.get('MUMBAI_PROVIDER'));
        break;
      default:
        break;
    }
    return client;
  }





}
