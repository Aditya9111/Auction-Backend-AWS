import {getAuctionByID} from './getAuctions';
import {uploadToS3} from '../lib/uploadToS3';
import {setAuctionPicURL} from '../lib/setAuctionPicURL';
import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import createError from 'http-errors';
import validator from '@middy/validator';
import cors from '@middy/http-cors';


import uploadAuctionPictureSchema from '../lib/schema/uploadAuctionPictureSchema';

export async function uploadAuctionPicture(event){
  const {id} = event.pathParameters;

const {email }= event.requestContext.authorizer;

  const auction = await getAuctionByID(id);

if(auction.seller !== email){
  throw new createError.Forbidden('You are not the seller ');
}

  const base64 = event.body.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64,'base64');

let updatedAuction;

try{
const picUrl = await uploadToS3(auction.id + '.jpeg' , buffer);
updatedAuction = await setAuctionPicURL(auction.id , picUrl)
}catch(error){
  console.log(error);
  throw new createError.InternalServerError(error);
}

  return{
    statusCode:200,
    body: JSON.stringify(updatedAuction),
  }
};


export const handler = middy(uploadAuctionPicture)
.use(httpErrorHandler())
.use(validator({inputSchema: uploadAuctionPictureSchema }))
.use(cors());
