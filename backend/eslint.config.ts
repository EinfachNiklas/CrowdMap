import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import { globalIgnores } from 'eslint/config'


export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  globalIgnores([
		"**node_modules/**",
    "**/dist/**",
    "**/coverage/**"
	]),
);