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
  matic = 'matic',
  polygonMumbai = 'polygonMumbai',
}


export const contractAddress = {
  ethereum: {
    WAVVY: '',
    POOL_REGISTRY: '',
    ERC20_TOKEN: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',  // weth
    POOL_REGISTRY_STORE: '',
    WAVVY_STORE: '',
  },
  matic: {
    WAVVY: '0xA18Dd17D2f1f39EFA8CBDC8B005cf556914f9db5',
    POOL_REGISTRY: '0xA031282e7b1Aca5A49e047C8f8B3f2dF8Cf7750D',
    ERC20_TOKEN: '',
    POOL_REGISTRY_STORE: '0x379774A9E66bB746e8861b2E1c2e26cd04Ea64E5',
    WAVVY_STORE: '0xeAe3A348876c8d70B50d58ECB1450cb9637F16A7',
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


export const seaportAddress = {
  ethereum: '0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC',
  goerli: '0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC',
  matic: '0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC',
  mumbai: '0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC',
}
