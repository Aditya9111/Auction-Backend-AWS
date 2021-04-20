const schema={
  properties:{
    body:{
      type:'object',
    properties:{
    amount:{type:'integer'},
  },
    required:['amount'],
  },
},
  required:['body'],
};


export default schema;
