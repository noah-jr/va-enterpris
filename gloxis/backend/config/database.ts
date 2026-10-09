import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig } from '@adonisjs/lucid'

import { readdirSync, existsSync } from 'node:fs'

/**
 * Dynamically resolves migration paths from all Bounded Contexts (Modules).
 * Prevents the need to manually register new modules here.
 */
function discoverModuleMigrations(): string[] {
  const modulesPath = app.makePath('app/Modules')
  if (!existsSync(modulesPath)) return []

  const allDirs = readdirSync(modulesPath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)

  const dependencyOrder = [
    'Clientes',
    'ProdutoFinanceiro',
    'SolicitacaoCredito',
    'AnaliseAprovacao',
    'Garantia',
    'OperacaoFinanceira',
    'Renegociacao',
  ]

  allDirs.sort((a, b) => {
    let indexA = dependencyOrder.indexOf(a)
    let indexB = dependencyOrder.indexOf(b)
    if (indexA === -1) indexA = 999
    if (indexB === -1) indexB = 999
    return indexA - indexB
  })

  return allDirs
    .map((dir) => `app/Modules/${dir}/Database/Migrations`)
    .filter((migrationPath) => existsSync(app.makePath(migrationPath)))
}

const dbConfig = defineConfig({
  /**
   * Default connection used for all queries.
   */
  connection: env.get('DB_CONNECTION', 'sqlite'),

  connections: {
    /**
     * SQLite connection (default).
     */
    sqlite: {
      client: 'better-sqlite3',
      connection: {
        filename: app.tmpPath('db.sqlite3'),
      },
      useNullAsDefault: true,
      migrations: {
        naturalSort: true,
        paths: ['database/migrations', ...discoverModuleMigrations(), 'database/migrations_alterations'],
      },
      schemaGeneration: {
        enabled: true,
        rulesPaths: ['./database/schema_rules.js'],
      },
    },

    /**
     * MySQL / MariaDB connection.
     * Install package to switch: npm install mysql2
     */
    mysql: {
      client: 'mysql2',
      connection: {
        host: env.get('DB_HOST'),
        port: env.get('DB_PORT'),
        user: env.get('DB_USER'),
        password: env.get('DB_PASSWORD'),
        database: env.get('DB_DATABASE'),
        ssl: { rejectUnauthorized: false },
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations', ...discoverModuleMigrations(), 'database/migrations_alterations'],
      },
      debug: app.inDev,
    },

    /**
     * Microsoft SQL Server connection.
     * Install package to switch: npm install tedious
     */
    // mssql: {
    //   client: 'mssql',
    //   connection: {
    //     server: env.get('DB_HOST'),
    //     port: env.get('DB_PORT'),
    //     user: env.get('DB_USER'),
    //     password: env.get('DB_PASSWORD'),
    //     database: env.get('DB_DATABASE'),
    //   },
    //   migrations: {
    //     naturalSort: true,
    //     paths: ['database/migrations'],
    //   },
    //   debug: app.inDev,
    // },

    /**
     * libSQL (Turso) connection.
     * Install package to switch: npm install @libsql/client
     */
    // libsql: {
    //   client: 'libsql',
    //   connection: {
    //     url: env.get('LIBSQL_URL'),
    //     authToken: env.get('LIBSQL_AUTH_TOKEN'),
    //   },
    //   useNullAsDefault: true,
    //   migrations: {
    //     naturalSort: true,
    //     paths: ['database/migrations'],
    //   },
    //   debug: app.inDev,
    // },
  },
})

export default dbConfig
