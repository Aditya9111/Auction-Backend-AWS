import AWS from "aws-sdk";
import validator from '@middy/validator';
import getAuctionsSchema from '../lib/schema/getAuctionsSchema';
import commonMiddleware from '../lib/commonMiddleWare';
import createError from 'http-errors';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getAuction(event, context) {
  const {status} = event.queryStringParameters;
let auctions;

const params={
  TableName:process.env.AUCTIONS_TABLE_NAME,
  IndexName:'statusandEndDate',
  KeyConditionExpression: "#status = :status",
  ExpressionAttributeValues:{
    ':status':status,
  },
  ExpressionAttributeNames:{
    '#status': 'status',
  }
}


try{
  const result = await dynamodb.query(params).promise();

auctions= result.Items;

}catch(error){
  console.error(error);
  throw new createError.InternalServerError(error);
}

  return {

    statusCode: 200,
    body: JSON.stringify(auctions),
  };
}

export const handler = commonMiddleware(getAuction)
.use(validator({inputSchema: getAuctionsSchema , useDefaults:true}));
