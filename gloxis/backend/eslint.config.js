import { configApp } from '@adonisjs/eslint-config'

export default configApp([
  {
    rules: {
      '@unicorn/filename-case': 'off',
      '@typescript-eslint/naming-convention': 'off',
      '@unicorn/no-await-expression-member': 'off',
    },
  },
])
