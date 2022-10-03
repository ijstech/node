const mysql = {
    host: '',
    user: '',
    password: '',
    database: ''
};
const redis = {
    host: '',
    password: '',
    db: 1
};
module.exports ={
    storage: {
        endpoint: 'https://ipfs.scom.dev',
        s3: {
            endpoint: '',
            bucket: '',
            key: '',
            secret: ''
        },
        web3Storage: {
            token: ''
        },
        log: {
            mysql: mysql
        }
    },
    worker: {
        jobQueue: "scheduler",
        connection: {
            redis: redis
        }
    },
    plugins: {
        db: {
            mysql: mysql
        },
        cache: {
            redis: redis
        }
    }
}