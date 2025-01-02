// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';
import path from "path";

export default defineNuxtConfig({
  devtools: { enabled: true },

  devServer: {
    host: 'localhost',
    port: 3000
  },

  modules: ['@pinia/nuxt', '@nuxt/icon'],
  
  runtimeConfig: {
    public: {
      apiBase: 'https://jsonplaceholder.typicode.com',
    },
  },

  ssr: false
});