import { ethers } from "ethers";
import Env from '@ioc:Adonis/Core/Env'

export enum supportedChains {
  ethereum = 'ethereum',
  matic = 'matic',
  polygonMumbai = 'polygonMumbai',
  bscTestnet = 'bscTestnet'
}


export const contractAddress = {
  ethereum: {
    WAVVY: '',
    POOL_REGISTRY: '',
    ERC20_TOKEN: '',
    POOL_REGISTRY_STORE: '',
    WAVVY_STORE: '',
  },
  polygon: {
    WAVVY: '',
    POOL_REGISTRY: '',
    ERC20_TOKEN: '',
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

export function getClient(network: supportedChains) {
  let client
  switch (network) {
    case 'ethereum':
      client = new ethers.providers.JsonRpcProvider(Env.get('MAINNET_PROVIDER'));
      break;
    case 'matic':
      client = new ethers.providers.JsonRpcProvider(Env.get('MATIC_PROVIDER'));
      break;
    case 'polygonMumbai':
      client = new ethers.providers.JsonRpcProvider(Env.get('MUMBAI_PROVIDER'));
      break;
    case 'bscTestnet':
      client = new ethers.providers.JsonRpcProvider(Env.get('BSC_TESTNET_PROVIDER'));
      break;
    default:
      break;
  }
  return client;
}


export function genRandomEOAWallet() {
  const { address, privateKey } = ethers.Wallet.createRandom();
  return {
    address,
    privateKey
  }
}

