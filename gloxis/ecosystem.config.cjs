module.exports = {
  apps: [
    {
      name: 'GLOXIS_BACKEND',
      cwd: '/var/www/gloxis/backend',
      script: './build/bin/server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3333,
        HOST: '0.0.0.0',
      },
    },
    {
      name: 'GLOXIS_ADMIN',
      cwd: '/var/www/gloxis/admin',
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
    {
      name: 'GLOXIS_CLIENT',
      cwd: '/var/www/gloxis/client',
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
    {
      name: 'GLOXIS_LANDING',
      cwd: '/var/www/gloxis/landing',
      script: 'npx',
      args: 'serve -s dist -l 5175',
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
