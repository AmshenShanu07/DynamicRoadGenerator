import restart from 'vite-plugin-restart';
import glsl from 'vite-plugin-glsl';

export default {
  root: 'src',
  publicDir: '../static/',
  base: './',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: true
  },
  plugins: [
    restart({ restart: [ '../static/**', ] }),
    glsl(),
  ]
}
