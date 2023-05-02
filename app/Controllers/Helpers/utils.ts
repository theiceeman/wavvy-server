
import { v4 as uuidv4 } from 'uuid';
import Env from '@ioc:Adonis/Core/Env'


export function getRpcUrl(network) {
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

export function convertIsoTimestampToDate(timestamp) {
  const dateObj = new Date(timestamp);
  const dayOfMonth = dateObj.getDate();
  const monthName = dateObj.toLocaleString("en-US", { month: "short" });

  const year = dateObj.getFullYear();
  const ordinal = getOrdinalSuffix(dayOfMonth);

  return `${dayOfMonth}${ordinal} ${monthName} ${year}`;

}


export function convertTimestampInSecsToDate(timestampInSecs) {
  const dateObj = new Date(timestampInSecs * 1000);
  const dayOfMonth = dateObj.getDate();
  const monthName = dateObj.toLocaleString("en-US", { month: "short" });

  const year = dateObj.getFullYear();
  const ordinal = getOrdinalSuffix(dayOfMonth);

  return `${dayOfMonth}${ordinal} ${monthName} ${year}`;

}


export function convertTimestampToSeconds(timestamp) {
  const dateObj = new Date(timestamp);
  const seconds = Math.floor(dateObj.getTime() / 1000);
  return seconds;
}



// Function to get the ordinal suffix for a number (e.g. "st", "nd", "rd", or "th")
function getOrdinalSuffix(number) {
  const suffixes = ["th", "st", "nd", "rd"];
  const lastDigit = number % 10;
  const suffix = suffixes[lastDigit] || "th";
  return suffix;
}
