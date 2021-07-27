import {
  CssBaseline,
  unstable_createMuiStrictModeTheme,
} from '@material-ui/core'
import { ThemeProvider } from '@material-ui/styles'
import Head from 'next/head'

import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/xq-light.css'
import '../styles/globals.css'

// Using this (instead of createTheme) to get rid of React strict mode warnings
// https://stackoverflow.com/a/64135466/390522
const theme = unstable_createMuiStrictModeTheme({
  palette: {
    primary: {
      main: '#076b26',
    },
  },
})

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />
        <meta name="description" content="SAML Mock SP and IdP" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  )
}

export default MyApp
