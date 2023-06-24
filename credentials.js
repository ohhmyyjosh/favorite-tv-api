module.exports = {
    cookieSecret: 'cookie',
    mongo: {
        development: {
        connectionString: 'mongodb://0.0.0.0:27017' // Defaults to localhost, change if using Mongodb Atlas
        },
        production: {
        connectionString: 'mongodb://0.0.0.0:27017'
        },
    }
};