const AWS = require('aws-sdk');
const fs = require("fs");
//const  csv  = require("csv");
const csv = require('csvtojson');
const request = require('request');
const bucket = event.Records[0].s3.bucket.name;
const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
exports.handler = async (event) => {
  // Set up the S3 client
  const s3 = new AWS.S3();
  const dynamodb = new AWS.DynamoDB();
  // Set up the parameters for the S3 getObject function
  const params1 = {
    Bucket: bucket,
    Key: key
  };

  // Fetch the file from S3
  const data = await s3.getObject(params1).promise();
  const stream = s3.getObject(params1).createReadStream();
  // convert csv file (stream) to JSON format data
  var json = await csv().fromStream(stream);
  console.log(Array.isArray(json));
  //console.log(json);
  
  //using API for adding data to databatse
    for (const item of json) {
        const options = {
            url: '<API-LINK>',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(item)
        };

        request(options, (error, response, body) => {
            if (error) {
                console.error(error);
                console.log(error);
            } else {
                console.log(body);
            }
        });
    }
   
  //optional - can mannually add data to our dynamodb
  for (const item of json) {
        // Insert the data into DynamoDB
        await dynamodb.putItem({
            TableName: '<NAME>',
            Item: {
                pid: { S: item.pid },
                name: { S: item.name },
                surname: { S: item.surname },
                dob: { S: item.dob },
                gender: { S: item.gender }
            }
            
        }).promise();
    }
  
  return json
};
