import {getEndedAuction} from '../lib/getEndedAuction';
import {closeAuction} from '../lib/closeAuction';
import createError from 'http-errors';



async function processAuctions(event,context){

  try{
  const auctionsToClose =await getEndedAuction();
  const closePromises = auctionsToClose.map(auction => closeAuction(auction));
  await Promise.all(closePromises);

  return {closed : closePromises.length}

}catch(error){
  throw new createError.InternalServerError(error);
}
}


export const handler = processAuctions;
