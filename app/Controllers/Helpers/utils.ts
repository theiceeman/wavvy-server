
import { v4 as uuidv4 } from 'uuid';
import Env from '@ioc:Adonis/Core/Env'


export  function getRpcUrl(network){
  let url
  switch (network) {
    case 'ethereum':
      url = Env.get('MAINNET_PROVIDER');
      break;
    case 'matic':
      url = Env.get('MATIC_PROVIDER');
      break;
    case 'mumbai':
      url = Env.get('MUMBAI_PROVIDER');
      break;
    default:
      break;
  }
  return url;

}


export async function formatErrorMessage(error) {
  let __error;
  if (error?.messages)
    __error = error.messages.errors[0].field + ' : ' + error.messages.errors[0].message
  else
    __error = error.message;

  return __error;
}

export function genRandomUuid() {
  return uuidv4()
}
