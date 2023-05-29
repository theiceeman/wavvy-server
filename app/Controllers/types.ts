export interface Collection {
  name: string,
  description: string,
  avatar: string;
  bannerImageUrl: string,
  owner: string,
  items: string,
  totalVolume: string,
  floorPrice: string,
  website: string | undefined
}

export enum supportedChains {
  ethereum = 'ethereum',
  goerli = 'goerli',
  // matic = 'matic',
  polygonMumbai = 'polygonMumbai',
  // bscTestnet = 'bscTestnet'
}


export const contractAddress = {
  ethereum: {
    WAVVY: '',
    POOL_REGISTRY: '',
    ERC20_TOKEN: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',  // weth
    POOL_REGISTRY_STORE: '',
    WAVVY_STORE: '',
  },
  polygon: {
    WAVVY: '',
    POOL_REGISTRY: '',
    ERC20_TOKEN: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
    POOL_REGISTRY_STORE: '',
    WAVVY_STORE: '',
  },
  polygonMumbai: {
    WAVVY: '0xCbA0894ae944DF4AcFFa60822b495Dbb0D90637a',
    POOL_REGISTRY: '0x221786808B9d68e6752BBeBC5cf92D4FfE8A8D6C',
    ERC20_TOKEN: '0x54B018c7ee1Dc20130d0CE639BCF221ab9365fF7',
    POOL_REGISTRY_STORE: '0x403C9e9B7d9cc123dF2107661deb65082501090C',
    WAVVY_STORE: '0x99138908662436c89BFAFbc28CEd06946a4a5BFA',
  },
  bscTestnet: {
    WAVVY: '',
    POOL_REGISTRY: '',
    ERC20_TOKEN: '',
    POOL_REGISTRY_STORE: '',
    WAVVY_STORE: '',
  }
}
