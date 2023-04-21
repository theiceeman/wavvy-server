import { ethers } from "ethers";
import Env from '@ioc:Adonis/Core/Env'

export function getClient(network) {
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
  return client;
}

export function genRandomEOAWallet() {
  // Create a random wallet
  const { address, privateKey } = ethers.Wallet.createRandom();

  // Print the wallet address and private key
  console.log('Wallet Address: ', address);
  console.log('Wallet Private Key: ', privateKey);
  return {
    address,
    privateKey
  }
}

