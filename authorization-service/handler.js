// const username = process.env.MY_GITHUB_ACCOUNT_ACCOUNT;

const decodeAuthorizationToken = (authToken) => {
    return authToken.split(':');
};

const generatePolicy = (effect) => {
    return {
        principalId: 'user',
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect: effect,
                    Resource: "arn:aws:execute-api:us-north-1:861385611523:gqe856ly01/*/*",
                },
            ],
        },
    };
};

const basicAuthorizer = async (event) => {
    const { headers, methodArn } = event;
    const authorizationHeader = headers.Authorization || headers.authorization;

    if (!authorizationHeader) {
        return {
            statusCode: 401,
            body: JSON.stringify({ message: 'Authorization header is missing' }),
        };
    }

    const credentials = decodeAuthorizationToken(authorizationHeader);
    const username = process.env.MY_GITHUB_ACCOUNT_ACCOUNT;
    const password = process.env.MY_GITHUB_ACCOUNT_PASSWORD;

    if (credentials[0] !== username && credentials[1] !== password) {
        return {
            statusCode: 403,
            body: JSON.stringify({ message: 'Access denied' + username + password }),
        };
    }

    const policy = generatePolicy('Allow', methodArn);

    return {
        statusCode: 200,
        body: JSON.stringify(policy),
    };
};

module.exports = { basicAuthorizer };