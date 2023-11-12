'use strict';

const AWS = require('aws-sdk');
const csv = require('csv-parser');
const s3 = new AWS.S3();
const sqs = new AWS.SQS();

module.exports = {
    importProductsFile:  async (event) => {
        const { name } = event.queryStringParameters;

        if (!name) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required query parameter "name"' }),
            };
        }

        const fileName = `uploaded/${name}`;

        const s3Params = {
            Bucket: 'task-5-bucket', // Replace with your S3 bucket name
            Key: fileName,
            Expires: 3600, // URL expiration time in seconds
            ContentType: 'text/csv', // Set the appropriate content type for your file
        };

        try {
            const signedUrl = s3.getSignedUrl('putObject', s3Params);
            return {
                statusCode: 200,
                body: JSON.stringify({ signedUrl }),
            };
        } catch (error) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to generate the signed URL' }),
            };
        }
    },

    importFileParser: async (event) => {
        const recordPromises = event.Records.map(async (record) => {
            const bucket = record.s3.bucket.name;
            const key = record.s3.object.key;

            const params = {
                Bucket: bucket,
                Key: key,
            };

            try {
                const s3Object = await s3.getObject(params).promise();
                const data = s3Object.Body.toString('utf-8');

                const parsedRecords = [];
                await new Promise((resolve, reject) => {
                    const stream = csv()
                        .on('data', (row) => {
                            parsedRecords.push(row);
                        })
                        .on('end', () => {
                            resolve();
                        })
                        .on('error', (error) => {
                            reject(error);
                        });

                    stream.write(data);
                    stream.end();
                });

                // Send each parsed record to an SQS queue
                for (const record of parsedRecords) {
                    await sqs.sendMessage({
                        QueueUrl: 'https://sqs.eu-north-1.amazonaws.com/861385611523/catalogItemsQueue',
                        MessageBody: JSON.stringify({ product: record }),
                    }).promise();
                }
            } catch (error) {
                console.error('Error processing S3 object:', error);
            }
        });

        await Promise.all(recordPromises);
    }
};