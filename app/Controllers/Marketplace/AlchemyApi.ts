import { Request } from "../Helpers/https";
import Env from '@ioc:Adonis/Core/Env'
import { ethers } from "ethers";
import abiManager from "../../../resources/abi";
import Web3 from 'web3';

interface Collection {
  name: string,
  description: string,
  avatar: string;
  owner: string,
  items: string,
  // total_volume: string,
  floorPrice: string,
  website: string
}

export default class AlchemyApi {


  // returns: name, description, avatar, *owner, items, *total_volume, floor_price, website.
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
    console.log({ collectionName, description, externalUrl, imageUrl, twitterUsername })
    let items = await this.getNftTotalSupply(address, network);
    // return items;

    let floorPriceUrl = this.getNftFloorPriceUrl(network, address)
    console.log({ res: floorPriceUrl })
    let floorPriceResponse = await Request.get(floorPriceUrl)
    if (!floorPriceResponse.ok)
      throw new Error('alchemy api unavailable!')
    let { floorPrice } = floorPriceResponse.data.data.openSea;

    return {
      name: collectionName,
      description,
      avatar: imageUrl,
      owner: twitterUsername,
      items,
      //
      floorPrice,
      website: externalUrl,
    }

  }

  public async getNftTokenAvatar(collectionAddress, tokenId, network) {
    let url = this.getNftMetadataUrl(network, collectionAddress, tokenId)
    let response = await Request.get(url)
    if (!response.ok)
      throw new Error('alchemy api unavailable!')
    let data = response.data.data;
    return data.media[0].gateway
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
        client = new ethers.JsonRpcProvider(Env.get('MAINNET_PROVIDER'));
        break;
      case 'matic':
        client = new ethers.JsonRpcProvider(Env.get('MATIC_PROVIDER'));
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
