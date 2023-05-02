import { ethers } from "ethers";
import Env from '@ioc:Adonis/Core/Env'

export enum supportedChains {
  ethereum = 'ethereum',
  matic = 'matic',
  polygonMumbai = 'polygonMumbai',
  bscTestnet = 'bscTestnet'
}

/*

  erc20token:0x2dccF6aE5d7CFab214f0E97B7695B5267e3efA91
  PoolRegistryStore:0x2902Bf62c6efc2679eF69894aaC02976f65C2920
  QredosStore:0xDb2F3d711049E106F2B820F1b9db772ecA7Bf5e8
  PoolRegistry: 0x5f200A6965594f8cEA96ccE4E5F5E10C81cA58C7
  Qredos: 0x821c80E9507A7D87b6103B9a292e10729A6817b9 */

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
    WAVVY: '0x821c80E9507A7D87b6103B9a292e10729A6817b9',
    POOL_REGISTRY: '0x5f200A6965594f8cEA96ccE4E5F5E10C81cA58C7',
    ERC20_TOKEN: '0x2dccF6aE5d7CFab214f0E97B7695B5267e3efA91',
    POOL_REGISTRY_STORE: '0x2902Bf62c6efc2679eF69894aaC02976f65C2920',
    WAVVY_STORE: '0xDb2F3d711049E106F2B820F1b9db772ecA7Bf5e8',
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

