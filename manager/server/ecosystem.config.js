module.exports = {
    apps: [
        {
            name: "SAAS::SERVER",       
            script: 'npm',            
            args: 'start', 
            exec_mode: "fork",      
            instances: 1,         
            autorestart: true,         
            watch: false,              
            time: true,               
            env: {
                NODE_ENV: 'production', 
                PORT: 5000            
            }
        }
    ]
};