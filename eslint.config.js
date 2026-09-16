import eslint from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import tseslint from 'typescript-eslint'

export default defineConfig(
  globalIgnores(['.output/**', 'dist/**', 'src/routeTree.gen.ts']),
  eslint.configs.recommended,
  tseslint.configs.recommended,
)
