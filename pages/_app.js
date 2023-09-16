import { CssBaseline, unstable_createMuiStrictModeTheme } from '@mui/material'
//import { ThemeProvider } from '@mui/styles'

import '../styles/globals.css'

// Using this (instead of createTheme) to get rid of React strict mode warnings
// https://stackoverflow.com/a/64135466/390522
// const theme = unstable_createMuiStrictModeTheme({
//   palette: {
//     primary: {
//       main: '#076b26',
//     },
//   },
// })

function MyApp({ Component, pageProps }) {
  return (
    <>
      <CssBaseline />
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
