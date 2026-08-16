import { defineConfig } from 'orval'

export default defineConfig({
  odyssey: {
    input: {
      target: 'http://localhost:8787/openapi.json',
    },
    output: {
      target: './src/generated/api.ts',
      schemas: './src/generated/models',
      client: 'react-query',
      httpClient: 'fetch',
      clean: true,
      baseUrl: 'http://localhost:8787',
    },
  },
})