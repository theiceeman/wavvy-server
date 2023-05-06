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
    WAVVY: '0x4A53F7a51400992a9E689853Eb06039c3B815fec',
    POOL_REGISTRY: '0xA18Dd17D2f1f39EFA8CBDC8B005cf556914f9db5',
    ERC20_TOKEN: '0xa16A2da88367580106342F6b848594C9C23c07D7',
    POOL_REGISTRY_STORE: '0x379774A9E66bB746e8861b2E1c2e26cd04Ea64E5',
    WAVVY_STORE: '0xA031282e7b1Aca5A49e047C8f8B3f2dF8Cf7750D',
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
      client = new ethers.JsonRpcProvider(Env.get('MAINNET_PROVIDER'));
      break;
    case 'matic':
      client = new ethers.JsonRpcProvider(Env.get('MATIC_PROVIDER'));
      break;
    case 'polygonMumbai':
      client = new ethers.JsonRpcProvider(Env.get('MUMBAI_PROVIDER'));
      break;
    case 'bscTestnet':
      client = new ethers.JsonRpcProvider(Env.get('BSC_TESTNET_PROVIDER'));
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

