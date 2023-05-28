import { ethers } from "ethers";
import Env from '@ioc:Adonis/Core/Env'
import { supportedChains } from "../types";



export function getClient(network: supportedChains) {
  let client
  switch (network) {
    case 'ethereum':
      client = new ethers.providers.JsonRpcProvider(Env.get('MAINNET_PROVIDER'));
      break;
    // case 'matic':
    //   client = new ethers.providers.JsonRpcProvider(Env.get('MATIC_PROVIDER'));
    //   break;
    case 'polygonMumbai':
      client = new ethers.providers.JsonRpcProvider(Env.get('MUMBAI_PROVIDER'));
      break;
    // case 'bscTestnet':
    //   client = new ethers.providers.JsonRpcProvider(Env.get('BSC_TESTNET_PROVIDER'));
    //   break;
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

