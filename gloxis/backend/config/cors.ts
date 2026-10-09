import app from '@adonisjs/core/services/app'
import { defineConfig } from '@adonisjs/cors'

import env from '#start/env'

/**
 * Configuration options to tweak the CORS policy. The following
 * options are documented on the official documentation website.
 *
 * https://docs.adonisjs.com/guides/security/cors
 */
const corsConfig = defineConfig({
  /**
   * Enable or disable CORS handling globally.
   */
  enabled: true,

  /**
   * Determine allowed origins dynamically based on env variable
   */
  origin: (origin) => {
    if (!origin) return true; // allow non-browser clients (postman, mobile apps)
    
    // Always allow localhost in development
    if (app.inDev && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      return true;
    }
    
    // In production, validate against ALLOWED_ORIGINS env variable
    const allowedStr = env.get('ALLOWED_ORIGINS')
    if (!allowedStr) {
      // Se a variável não estiver definida, bloqueia por padrão em produção (a menos que seja Vercel)
      return origin.includes('vercel.app'); 
    }
    
    const whitelist = allowedStr.split(',').map((o: string) => o.trim())
    return whitelist.includes(origin)
  },

  /**
   * HTTP methods accepted for cross-origin requests.
   */
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'],

  /**
   * Reflect request headers by default. Use a string array to restrict
   * allowed headers.
   */
  headers: true,

  /**
   * Response headers exposed to the browser.
   */
  exposeHeaders: [],

  /**
   * Allow cookies/authorization headers on cross-origin requests.
   */
  credentials: true,

  /**
   * Cache CORS preflight response for N seconds.
   */
  maxAge: 90,
})

export default corsConfig
