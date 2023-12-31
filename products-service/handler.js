'use strict';

const AWS = require('aws-sdk');
const { randomUUID } = require('crypto');

const dynamoDB = new AWS.DynamoDB.DocumentClient({ region: 'eu-west-1' });

module.exports = {
  getProductsList:  async () => {
    const params = {
      TableName: process.env.PRODUCTS_TABLE, // Replace with your table name
    };

    try {
      const data = await dynamoDB.scan(params).promise();
      const products = data.Items;
      const stockProducts = [];
      for (const { id, ...rest} of products) {
        const params = {
          TableName: process.env.STOCKS_TABLE,
          KeyConditionExpression: 'product_id = :id',
          ExpressionAttributeValues: {
            ':id': id,
          },
        };

        try {
          const data = await dynamoDB.query(params).promise();
          const stockItem = data.Items[0]; // Assuming there's one stock item per product
          if (stockItem) {
            stockProducts.push({ id, ...rest, count: stockItem.count });
          }
        } catch (err) {
          console.error('Error querying DynamoDB for product_id:', productId, err);
        }
      }

      return {
        statusCode: 200,
        body: JSON.stringify(stockProducts),
      };
    } catch (error) {
      console.error('Error getting products from DynamoDB:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Internal Server Error' }),
      };
    }
  },

  getProductById: async (event) => {
    var params = event.pathParameters;
    if (params && params.productId) {
      var id = params.productId;
      const productQueryParams = {
        TableName: process.env.PRODUCTS_TABLE,
        Key: {
          id: id,
        },
      };

      try {
        const productData = await dynamoDB.get(productQueryParams).promise();
        const product = productData.Item;

        if (product) {
          // Next, query the stocks table to get the stock count
          const stockQueryParams = {
            TableName: process.env.STOCKS_TABLE,
            KeyConditionExpression: 'product_id = :id',
            ExpressionAttributeValues: {
              ':id': product.id,
            },
          };

          const stockData = await dynamoDB.query(stockQueryParams).promise();
          const stockItem = stockData.Items[0]; // Assuming there's one stock item per product

          if (stockItem) {
            return {
              statusCode: 200,
              body: JSON.stringify({...product, count: stockItem.count}),
            };
          } else {
            console.log('Product found, but no stock information available.');
            return {
              statusCode: 404,
              body: JSON.stringify({error: "Product not found but no stock"}),
            };
          }
        } else {
          console.log('Product not found.');
          return {
            statusCode: 404,
            body: JSON.stringify({error: "Product not found"}),
          };
        }
      } catch (err) {
        console.error('Error querying DynamoDB:', err);
        return {
          statusCode: 404,
          body: JSON.stringify(JSON.stringify(err)),
        };
      }
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ "message" : "Bad Request"}, null, 2),
      };
    }
  },

  createProduct: async (event) => {
    try {
      const { body } = event;
      const product = JSON.parse(body);

      if (!product.title || !product.price) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'Invalid input. Title and price are required.' }),
        };
      }

      const productId = randomUUID(); // Generate a unique ID for the new product

      const params = {
        TableName: process.env.PRODUCTS_TABLE,
        Item: {
          id: productId,
          title: product.name,
          description: product.description,
          price: product.price
        },
      };

      await dynamoDB.put(params).promise();

      return {
        statusCode: 201,
        body: JSON.stringify({ message: 'Product created successfully', productId }),
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Error creating product', error: error.message }),
      };
    }
  }
};