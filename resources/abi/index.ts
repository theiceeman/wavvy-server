
import erc20Abi from './erc20.json';
import erc721Abi from './erc721.json';
import {abi as PoolRegistryAbi} from './PoolRegistry.json';
import {abi as PoolRegistryStoreAbi} from './PoolRegistryStore.json';
import {abi as WavvyAbi} from './Wavvy.json';
import {abi as WavvyStoreAbi} from './WavvyStore.json';

const abiManager = {
  erc20Abi,
  erc721Abi,
  PoolRegistryAbi,
  PoolRegistryStoreAbi,
  WavvyAbi,
  WavvyStoreAbi
}


export default abiManager;
