module.exports ={
    storage: {
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
            mysql: {
                host: '',
                user: '',
                password: '',
                database: ''
            }
        }
    },
    worker: {
        jobQueue: "request",
        connection: {
            redis: {
                host: '',
                password: '',
                db: 0
            }
        }
    },
    plugins: {
        db: {
            mysql: {
                host: '',
                user: '',
                password: '',
                database: ''
            }
        },
        cache: {
            redis: {
                host: '',
                password: '',
                db: 0
            }
        }
    }
}