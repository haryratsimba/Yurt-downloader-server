const gulp = require('gulp');
const commonjs = require('rollup-plugin-commonjs');
const rollup = require('rollup-stream');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('rollup-plugin-babel');
const vue = require('rollup-plugin-vue2');
const resolve = require('rollup-plugin-node-resolve');
const globals = require('rollup-plugin-node-globals');
const builtins = require('rollup-plugin-node-builtins');
const json = require('rollup-plugin-json');

const babelConfig = {
  presets: [
    ["env", {
      modules: false
    }]
  ],
  // transform-runtime for async / await
  plugins: ["external-helpers", "transform-runtime"],
  // Exclude node_modules from being transpiled
  exclude: "node_modules/**",
  babelrc: false,
  runtimeHelpers: true
};

gulp.task('build', () => {
  return rollup({
      input: './app/app.js',
      format: 'iife',
      plugins: [
        // vue before any transpiler (https://github.com/thgh/rollup-plugin-vue2)
        vue({
          compileTemplate: true
        }),
        json({
          include: './node_modules/**',
          preferConst: true, // Default: false
          indent: '  '
        }),
        // Import nodejs built-in lib like events, http etc.
        babel(babelConfig),
        builtins(),
        // Locate modules on node_modules
        resolve({
          browser: true,
          preferBuiltins: true
        }),
        // Convert commonJS modules to ES modules
        commonjs({
          include: './node_modules/**'
        }),
        globals(),
      ]
    })
    // Print rollup errors : https://github.com/Permutatrix/rollup-stream/issues/16
    .on('error', (err) => {
      console.error(err);
    })
    .pipe(source('build.js', './dist/'))
    // we need to buffer the output, since many gulp plugins don't support streams
    .pipe(buffer())
    .pipe(sourcemaps.init({
      loadMaps: true
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./dist/'));
});
