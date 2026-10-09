module.exports = {
  apps: [
    {
      name: 'GLOXIS_ADMIN',
      script: 'npx',
      args: 'serve -s dist -l 5173',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
