import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import './custom.css'

const gaId = import.meta.env.VITE_GA_ID || ''

function sendPageView(path) {
  if (
    !gaId ||
    typeof window === 'undefined' ||
    typeof window.gtag !== 'function'
  ) {
    return
  }

  window.gtag('config', gaId, {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title
  })
}

export default {
  extends: DefaultTheme,
  Layout,

  enhanceApp({ router }) {
    if (!import.meta.env.SSR && gaId) {
      router.onAfterRouteChange = (to) => {
        sendPageView(to)
      }
    }
  }
}
