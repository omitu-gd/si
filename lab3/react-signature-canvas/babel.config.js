const pkgJson = require('./package.json')

const runtimeVersion = pkgJson.dependencies['@babel/runtime']
// eslint-disable-next-line dot-notation -- this conflicts with tsc, possibly due to outdated ESLint
const NODE_ENV = process.env['NODE_ENV']

/** @type {import('@babel/core').ConfigFunction} */
module.exports = api => {
  api.cache.using(() => NODE_ENV + '_' + runtimeVersion) // cache based on NODE_ENV and runtimeVersion

  // normally use browserslistrc, but for Jest, use current version of Node
  const isTest = api.env('test')
  const jestTargets = { targets: { node: 'current' } }
  /** @type {[import('@babel/core').PluginTarget, import('@babel/core').PluginOptions]} */
  const presetEnv = ['@babel/preset-env', { bugfixes: true }]
  if (isTest) presetEnv[1] = { ...presetEnv[1], ...jestTargets }

  return {
    // @ts-expect-error -- @types/babel__core doesn't specify assumptions yet
    assumptions: {
      // optimizations equivalent to previous Babel 6 "loose" behavior for preset-stage-2 (https://github.com/babel/rfcs/blob/main/rfcs/0003-top-level-assumptions.md#assumptions-list, https://github.com/babel/babel/tree/v7.5.5/packages/babel-preset-stage-2)
      setPublicClassFields: true,
      constantSuper: true
    },
    presets: [
      presetEnv,
      '@babel/preset-typescript',
      '@babel/preset-react'
    ],
    plugins: [
      // used with @rollup/plugin-babel
      ['@babel/plugin-transform-runtime', {
        regenerator: false, // not used, and would prefer babel-polyfills over this anyway
        version: runtimeVersion // @babel/runtime's version
      }]
    ]
  }
}
