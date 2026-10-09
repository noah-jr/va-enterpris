
module.exports =  {
    apps: [
        {
            name: 'FILOGO:CISP',
            script: 'npm',
            args: 'start',
            exec_mode: 'fork',
            instances: 1,
            autorestart: true,
            watch: false,
            time: true,
            env: {
                NODE_ENV: 'production',
                PORT: 3002,
            }
        }
    ]
}