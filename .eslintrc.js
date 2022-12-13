module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'standard-with-typescript',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2020,
    project: './tsconfig.json'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',

    'no-unused-vars': 0, // Provided by TypeScript
    'no-undef': 0 // Provided by TypeScript
  }
}
