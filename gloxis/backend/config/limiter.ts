import { defineConfig, stores } from '@adonisjs/limiter'

const limiterConfig = defineConfig({
  default: 'memory',
  stores: {
    /**
     * Memory store for rate limiting
     */
    memory: stores.memory({}),
  },
})

export default limiterConfig

declare module '@adonisjs/limiter/types' {
  export interface LimitersList extends InferLimiters<typeof limiterConfig> {}
}
