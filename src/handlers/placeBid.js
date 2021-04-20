import { v4 as uuid } from "uuid";
import AWS from "aws-sdk";
import commonMiddleware from '../lib/commonMiddleWare';
import createError from 'http-errors';
import validator from '@middy/validator';
import placeBidSchema from '../lib/schema/placeBidSchema';
import {getAuctionByID} from './getAuctions';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, context) {
const {id} = event.pathParameters;
const {amount}=event.body;
const {email }= event.requestContext.authorizer;


const auction =await getAuctionByID(id);

if(auction.status != 'OPEN'){
  throw new createError.Forbidden('You cannot bid on closed auction')
}

if(amount <= auction.highestBid.amount){
  throw new createError.Forbidden(`Your bid must be more than ${auction.highestBid.amount}`)
}

if(email === auction.highestBid.bidder){
  throw new createError.Forbidden('You are already the highest bidder')
}

if(email === auction.seller){
  throw new createError.Forbidden('You cannot bid on your own product')
}

const params={
  TableName:process.env.AUCTIONS_TABLE_NAME,
  Key: {id},
  UpdateExpression: 'set highestBid.amount= :amount, highestBid.bidder = :bidder',
  ExpressionAttributeValues:{
    ':amount' : amount,
    ':bidder': email,
  },
  ReturnValues:'ALL_NEW'
}

let updatedAuction;

try{
  const results=await dynamodb.update(params).promise();
  updatedAuction= results.Attributes;
}catch(error){
  console.error(error);
  throw new createError.InternalServerError(error);
}


  return {
  
    statusCode: 201,
    body: JSON.stringify(updatedAuction),
  };
}

export const handler = commonMiddleware(placeBid)
.use(validator({inputSchema: placeBidSchema}))
