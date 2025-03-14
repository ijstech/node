const redis = {
    host: '',
    password: '',
    db: 1
};
const mysql = {
    host: '',
    user: '',
    password: '',
    database: ''
};
module.exports ={
    worker: {
        connection: {
            redis: redis
        }
    },
    http: {
        port: 8080,
        worker: {
            jobQueue: "request",
            connection: {
                redis: redis
            }
        }
    },
    plugins: {
        db: {
            mysql: mysql
        },
        cache: {
            redis: redis
        },
        queue: {
            jobQueue: "request",
            connection: {
                redis: redis
            }
        },
        wallet: {
            accounts: [],
            chainId: 97,
            networks: {
                97: {
                    provider: 'https://data-seed-prebsc-1-s2.binance.org:8545'
                }
            }
        }
    }
}