import { defineConfig, loadEnv } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver, VueUseComponentsResolver } from 'unplugin-vue-components/resolvers'
import WindiCSS from 'vite-plugin-windicss'
import Markdown from 'vite-plugin-md'
import Pages from 'vite-plugin-pages'
import Prism from 'markdown-it-prism'

const defaultClasses = 'prose prose-sm m-auto text-left'
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd())
    console.log(
        process.env.VITE_BASE_PUBLIC_PATH,
        env.VITE_BASE_PUBLIC_PATH,
        env,
        mode,
        process.cwd()
    )
    process.env.VITE_BASE_PUBLIC_PATH =
        process.env.VITE_BASE_PUBLIC_PATH || env.VITE_BASE_PUBLIC_PATH
    return {
        base: env.VITE_BASE_PUBLIC_PATH,
        resolve: {
            alias: {
                '@': resolve(__dirname, 'src')
            }
        },
        plugins: [
            vue({ include: [/\.vue$/, /\.md$/] }),
            AutoImport({
                dts: './auto-imports.d.ts',
                // include: [/\.vue$/, /\.md$/],
                imports: [
                    'vue',
                    'vue-router',
                    'vue-i18n',
                    // custom
                    {
                        '@vueuse/core': [
                            // named imports
                            'useMouse', // import { useMouse } from '@vueuse/core',
                            // alias
                            ['useFetch', 'useMyFetch'] // import { useFetch as useMyFetch } from '@vueuse/core',
                        ],
                        axios: [
                            // default imports
                            ['default', 'axios'] // import { default as axios } from 'axios',
                        ],
                        // '[package-name]': [
                        //     '[import-names]',
                        //     // alias
                        //     ['[from]', '[alias]']
                        // ]
                    }
                ],
                eslintrc: {
                    enabled: false, // Default `false`
                    filepath: './.eslintrc-auto-import.json', // Default `./.eslintrc-auto-import.json`
                    globalsPropValue: true // Default `true`, (true | false | 'readonly' | 'readable' | 'writable' | 'writeable')
                }
            }),
            Components({
                dts: './components.d.ts',
                extensions: ['vue', 'md'],
                include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
                dirs: ['src/components/', 'src/views'],
                resolvers: [NaiveUiResolver(), VueUseComponentsResolver()]
            }),
            WindiCSS({
                safelist: defaultClasses
            }),
            Markdown({
                wrapperClasses: defaultClasses,
                headEnabled: false,
                markdownItSetup(md) {
                    // prismjs.com/
                    https: md.use(Prism)
                    // ??? md ??????????????????????????? ???????????????
                    // md.use(LinkAttributes, {
                    //   matcher: (link: string) => /^https?:\/\//.test(link),
                    //   attrs: {
                    //     target: '_blank',
                    //     rel: 'noopener',
                    //   },
                    // });
                }
            }),
            Pages({
                dirs: [
                    {
                        dir: 'src/views',
                        // baseRoute: process.env.VITE_BASE_PUBLIC_PATH
                        baseRoute: ''
                    }
                ],
                // extendRoute (route, parent) {
                //   console.log(route, parent)
                //   return { ...route, label: route.name }
                // },
                extensions: ['vue', 'md'],
                exclude: ['**/__*__.vue']
            })
        ],
        // ????????????
        server: {
            host: true, // host?????????true???????????????network???????????????ip????????????
            port: 8080, // ?????????
            open: true, // ?????????????????????
            cors: true, // ??????????????????
            strictPort: true, // ?????????????????????????????????
            // ????????????
            proxy: {
                '/api': {
                    // ?????? 8000 ????????????????????? ????????? 8888 ???????????????
                    target: 'http://localhost:8888/',
                    changeOrigin: true, // ????????????
                    rewrite: (path) => path.replace('/api/', '/')
                }
            }
        },
        build: {
            brotliSize: false,
            // ????????????????????????500kb??????
            chunkSizeWarningLimit: 2000,
            // ?????????????????????console.log
            terserOptions: {
                compress: {
                    drop_console: true,
                    drop_debugger: true
                }
            },
            assetsDir: 'static/assets',
            // ?????????????????????dist??????????????????
            rollupOptions: {
                output: {
                    chunkFileNames: 'static/js/[name]-[hash].js',
                    entryFileNames: 'static/js/[name]-[hash].js',
                    assetFileNames: 'static/[ext]/[name]-[hash].[ext]'
                }
            }
        }
    }
})
