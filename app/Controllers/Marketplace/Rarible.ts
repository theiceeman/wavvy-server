import { Request } from "../Helpers/https"

interface Collection {
  name: string,
  description: string,
  owner: string,
  no_of_owners: string,
  no_of_items: string,
  total_volume: string,
  floor_price: string,
  website: string
}

export default class Rarible {


  // returns: name, description, owner, items, total_volume, floor_price, website.
  public async collectionDetails(address, network): Promise<Collection> {

    let url = `https://api.rarible.org/v0.1/collections/${(network.toUpperCase())}:${address}`
    let response = await Request.get(url)
    if (!response.ok)
      throw new Error('marketplace unavailable!')

    let data = response.data.data;
    return data


    /*
    {
  "id": "ETHEREUM:0xd07dc4262bcdbf85190c01c996b4c06a461d2430",
  "blockchain": "ETHEREUM",
  "type": "ERC1155",
  "status": "CONFIRMED",
  "name": "Rarible",
  "symbol": "RARI",
  "owner": "ETHEREUM:0x5675ff50d5d48b87fbcfbcbfc78f15f4964fe9c5",
  "features": [
      "APPROVE_FOR_ALL",
      "SET_URI_PREFIX",
      "BURN",
      "SECONDARY_SALE_FEES",
      "MINT_WITH_ADDRESS"
  ],
  "minters": [],
  "meta": {
      "name": "Rarible 1155",
      "description": "Create and sell digital collectibles secured with blockchain technology. Rarible is home to thousands of artists and collectors, creating and exchanging immutable art without using code. Trade with RARI token on OpenSea.",
      "tags": [],
      "genres": [],
      "externalUri": "https://rarible.com/",
      "content": [
          {
              "@type": "IMAGE",
              "url": "https://i.seadn.io/gae/FG0QJ00fN3c_FWuPeUr9-T__iQl63j9hn5d6svW8UqOmia5zp3lKHPkJuHcvhZ0f_Pd6P2COo9tt9zVUvdPxG_9BBw?w=500&auto=format",
              "representation": "ORIGINAL",
              "mimeType": "image/png",
              "size": 2803,
              "available": true,
              "width": 400,
              "height": 400
          }
      ],
      "externalLink": "https://rarible.com/",
      "sellerFeeBasisPoints": 50
  },
  "originOrders": [],
  "self": false
}
     */





    return {
      // name,
      // description,
      // owner,
      // no_of_owners,
      // no_of_items,
      // total_volume,
      // floor_price,
      // website
    }
  }


}
