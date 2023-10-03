import { CssBaseline } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import NextNProgress from 'nextjs-progressbar'

import '../styles/globals.css'

const theme = createTheme({
  palette: {
    primary: {
      main: '#076b26',
    },
  },
})

function MyApp({ Component, pageProps }) {
  return (
    <>
      <NextNProgress color="#076b26" />
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  )
}

export default MyApp
