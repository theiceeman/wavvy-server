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
    WAVVY: '0xDeee23398Bb90727a2122b4EcB61d55aD6467B33',
    POOL_REGISTRY: '0x783314f202f46Af3c6D4fa6cab13802696440f6C',
    ERC20_TOKEN: '0x2b2498C69120CdD77FAA92bEa37F48a1Ba0D97F9',
    POOL_REGISTRY_STORE: '0x3aC97DeBC8894449383Fa6452d580a29F1AE8DaD',
    WAVVY_STORE: '0x6F193D348741e4F5Ba8Efbcd427895B984d2a260',
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

