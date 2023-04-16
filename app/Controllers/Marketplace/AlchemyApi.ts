import { Request } from "../Helpers/https";
import Env from '@ioc:Adonis/Core/Env'
import { ethers } from "ethers";
// import Web3 from 'web3';
import abiManager from "../../../resources/abi";

export default class AlchemyApi {


  // returns: name, description, avatar, *owner, items, *total_volume, floor_price, website.
  public async getCollectionDetails(address, network) {

    let url = this.getNftMetadataUrl(network, address)
    let response = await Request.get(url)
    if (!response.ok)
      throw new Error('alchemy api unavailable!')
    let data = response.data.data;
    let { collectionName, description, externalUrl, imageUrl } = data.contractMetadata.openSea

    let items = await this.getNftTotalSupply(address, network);


    let floorPriceUrl = this.getNftFloorPriceUrl(network, address)
    let floorPriceResponse = await Request.get(floorPriceUrl)
    if (!floorPriceResponse.ok)
      throw new Error('alchemy api unavailable!')
    let { floorPrice } = floorPriceResponse.data.data.openSea;

    return {
      name: collectionName,
      description,
      avatar: imageUrl,
      //
      items,
      //
      floor_price: floorPrice,
      website: externalUrl,
    }

  }

  private getNftMetadataUrl(network, address) {
    let url;
    switch (network) {
      case 'ethereum':
        url = `https://eth-mainnet.g.alchemy.com/nft/v2/${Env.get('ALCHEMY_API_KEY')}/getNFTMetadata?contractAddress=${address}&tokenId=1`;
        break;

      case 'matic':
        url = `https://polygon-mainnet.g.alchemy.com/nft/v2/${Env.get('ALCHEMY_API_KEY')}/getNFTMetadata?contractAddress=${address}&tokenId=1`;
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

    const contract = new ethers.Contract(contractAddress, abiManager.erc721Abi.abi, client);
    return await contract.totalSupply();

  }




}
