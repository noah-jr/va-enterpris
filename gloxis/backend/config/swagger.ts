import url from 'node:url'

export default {
  path: url.fileURLToPath(new URL('../', import.meta.url)),
  title: 'Gloxis API',
  version: '1.0.0',
  tagIndex: 2,
  info: {
    title: 'Gloxis API',
    version: '1.0.0',
    description: 'Gloxis API documentation',
  },
  snakeCase: true,
  debug: false,
  ignore: ['/swagger', '/docs'],
  preferredPutPatch: 'PUT',
  common: {
    parameters: {},
    headers: {},
  },
  securitySchemes: {
    BearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
  },
  authMiddlewares: ['auth', 'auth:api'],
  defaultSecurityScheme: 'BearerAuth',
  persistAuthorization: true,
}
