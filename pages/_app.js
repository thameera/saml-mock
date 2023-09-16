import {
  CssBaseline,
  unstable_createMuiStrictModeTheme,
} from '@material-ui/core'
import { ThemeProvider } from '@material-ui/styles'

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
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  )
}

export default MyApp
