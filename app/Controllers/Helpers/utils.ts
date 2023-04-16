
import { v4 as uuidv4 } from 'uuid';


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
