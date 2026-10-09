module.exports = {
  apps: [
    {
      name: 'GLOXIS_BACKEND',
      script: './bin/server.js',
      cwd: './build',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3332,
        HOST: '0.0.0.0',
      },
    },
  ],
}
