import { Request } from "../Helpers/https";
import Env from '@ioc:Adonis/Core/Env'
import { ethers } from "ethers";
import abiManager from "../../../resources/abi";
import { Collection } from "../types";



export default class AlchemyApi {


  public async getCollectionDetails(address, network): Promise<Collection> {

    let url = this.getNftMetadataUrl(network, address, 1)
    let response = await Request.get(url)
    if (!response.ok)
      throw new Error('alchemy api unavailable!')
    let data = response.data.data;
    let collectionName, description, externalUrl, imageUrl, twitterUsername;

    let opensea = data.contractMetadata.openSea
    if (opensea.hasOwnProperty('collectionName')) {
      collectionName = opensea.collectionName,
        description = opensea.description,
        externalUrl = opensea.externalUrl,
        imageUrl = opensea.imageUrl,
        twitterUsername = opensea.twitterUsername
    } else {
      collectionName = data.title,
        description = data.description,
        externalUrl = '',
        imageUrl = data.media[0].gateway,
        twitterUsername = ''

    }
    // let items = await this.getNftTotalSupply(address, network);
    let items = 'null';

    let floorPriceUrl = this.getNftFloorPriceUrl(network, address)
    let floorPriceResponse = await Request.get(floorPriceUrl)
    let floorPrice;
    if (!floorPriceResponse.ok) {
      floorPrice = 'null'
    }
    else {
      let res = floorPriceResponse.data.data.openSea;
      floorPrice = res.floorPrice
    }

    return {
      name: collectionName,
      description,
      avatar: imageUrl,
      owner: twitterUsername,
      items,
      //
      floorPrice,
      website: externalUrl,
      bannerImageUrl: 'null',
      totalVolume: 'null'
    }

  }

  public async getNftTokenAvatar(collectionAddress, tokenId, network) {
    try {
      let url = this.getNftMetadataUrl(network, collectionAddress, tokenId)
      let response = await Request.get(url)
      if (!response.ok)
        throw new Error('alchemy api unavailable!')
      let data = response.data.data;
      return data.media[0].gateway
    } catch (error) {
      console.log({ getNftTokenAvatar: error })
    }
  }

  private getNftMetadataUrl(network, address, tokenId) {
    let url;
    switch (network) {
      case 'ethereum':
        url = `https://eth-mainnet.g.alchemy.com/nft/v2/${Env.get('ALCHEMY_API_KEY')}/getNFTMetadata?contractAddress=${address}&tokenId=${tokenId}`;
        break;

      case 'matic':
        url = `https://polygon-mainnet.g.alchemy.com/nft/v2/${Env.get('ALCHEMY_API_KEY')}/getNFTMetadata?contractAddress=${address}&tokenId=${tokenId}`;
        break;

      default:
        break;
    }
    return url;
  }

  private getNftFloorPriceUrl(network, address) {
    let url;
    switch (network) {
      case 'ethereum':
        url = `https://eth-mainnet.g.alchemy.com/nft/v2/${Env.get('ALCHEMY_API_KEY')}/getFloorPrice?contractAddress=${address}`;
        break;

      case 'matic':
        url = `https://polygon-mainnet.g.alchemy.com/nft/v2/${Env.get('ALCHEMY_API_KEY')}/getFloorPrice?contractAddress=${address}`;
        break;

      default:
        break;
    }
    return url;
  }


  private async getNftTotalSupply(contractAddress, network) {
    let client
    switch (network) {
      case 'ethereum':
        client = new ethers.providers.JsonRpcProvider(Env.get('MAINNET_PROVIDER'));
        break;
      case 'matic':
        client = new ethers.providers.JsonRpcProvider(Env.get('MATIC_PROVIDER'));
        break;
      default:
        break;
    }

    // console.log({client:(await client.getNetwork()).toJSON()})
    // return client

    const contract = new ethers.Contract(contractAddress, abiManager.erc721Abi.abi, client);
    return await contract.totalSupply();

  }




}
