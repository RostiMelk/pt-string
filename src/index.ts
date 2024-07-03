import {definePlugin} from 'sanity'
import {ptStringType} from './schema'

interface PtStringConfig {
  /* nothing here yet */
}

/**
 * Usage in `sanity.config.ts` (or .js)
 *
 * ```ts
 * import {defineConfig} from 'sanity'
 * import {ptString} from 'pt-string'
 *
 * export default defineConfig({
 *   // ...
 *   plugins: [ptString()],
 * })
 * ```
 */
export const ptString = definePlugin<PtStringConfig | void>((config = {}) => {
  return {
    name: 'pt-string',
    schema: {types: [ptStringType]},
  }
})
