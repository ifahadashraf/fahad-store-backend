var AWS = require('aws-sdk');

// Set your AWS region and DynamoDB table name
var region = 'eu-west-1';

// Initialize DynamoDB Document Client
var dynamoDB = new AWS.DynamoDB.DocumentClient({ region });

// Sample Data
var products = [
    {
        id: '75881878-777d-11ee-b962-0242ac120002',
        title: 'Product 1',
        description: 'Description for Product 1',
        price: 19.99,
    },
    {
        id: '75881a30-777d-11ee-b962-0242ac120002',
        title: 'Product 2',
        description: 'Description for Product 2',
        price: 29.99,
    },
    {
        id: '758820d4-777d-11ee-b962-0242ac120002',
        title: 'Product 3',
        description: 'Description for Product 3',
        price: 39.99,
    },
    {
        id: '758822aa-777d-11ee-b962-0242ac120002',
        title: 'Product 4',
        description: 'Description for Product 4',
        price: 49.99,
    },
];

var stocks = [
    {
        product_id: '75881878-777d-11ee-b962-0242ac120002',
        count: 5,
    },
    {
        product_id: '75881a30-777d-11ee-b962-0242ac120002',
        count: 3,
    },
    {
        product_id: '758820d4-777d-11ee-b962-0242ac120002',
        count: 10,
    },
    {
        product_id: '758822aa-777d-11ee-b962-0242ac120002',
        count: 2,
    },
];

// Function to upload data to DynamoDB
function uploadData(tableName, data) {
    for (var i = 0; i < data.length; i++) {
        var item = data[i];
        var params = {
            TableName: tableName,
            Item: item,
        };

        dynamoDB.put(params, function(error) {
            if (!error) {
                console.log('Uploaded product: ' + item.id);
            } else {
                console.error('Error uploading product ' + item.id + ': ' + error.message);
            }
        });
    }
}

// Call the uploadData function to start the upload
uploadData('Products', products);
uploadData('Stocks', stocks);
