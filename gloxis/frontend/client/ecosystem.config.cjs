module.exports = {
  apps: [
    {
      name: 'GLOXIS_CLIENT',
      script: 'npx',
      args: 'serve -s dist -l 5174',
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
