import { AppBar, Toolbar, Typography } from '@material-ui/core'
import Head from 'next/head'

export default function Home() {
  return (
    <>
      <Head>
        <title>SAML Mock SP</title>
      </Head>

      <AppBar position="sticky" color="transparent">
        <Toolbar>
          <Typography variant="h5">SAML Mock SP</Typography>
        </Toolbar>
      </AppBar>

      <Typography variant="h4">Not Implemented</Typography>
    </>
  )
}
