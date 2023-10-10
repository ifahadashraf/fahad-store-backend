'use strict';

const products = require('./products');

module.exports = {
  getProductsList:  async () => {
    return {
      statusCode: 200,
      body: JSON.stringify(products, null, 2),
    };
  },

  getProductById: async (event) => {
    var params = event.pathParameters;
    try {
      if (params && params.productId) {
        var id = params.productId;
        var product = products.find(function (x) {
          return x.id === id;
        });
        if (!product) {
          throw new Error();
        }
        return {
          statusCode: 200,
          body: JSON.stringify(product, null, 2),
        };
      }
      throw new Error();
    } catch (e) {
      return {
        statusCode: 404,
        body: JSON.stringify({ "message" : "Product not found"}, null, 2),
      };
    }
  },
};