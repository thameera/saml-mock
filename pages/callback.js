import Head from 'next/head'
import { AppBar, Button, Paper, Toolbar, Typography } from '@material-ui/core'
import parse from 'urlencoded-body-parser'
import styles from '../styles/Home.module.css'

export default function Callback(props) {
  return (
    <>
      <Head>
        <title>SAML Mock SP</title>
      </Head>

      <AppBar position="sticky" color="transparent">
        <Toolbar>
          <Typography variant="h5">SAML Mock Callback [WIP]</Typography>
          <div className={styles.grow} />
          <Button
            variant="contained"
            color="primary"
            className={styles.button}
            href="/sp"
          >
            New Request
          </Button>
        </Toolbar>
      </AppBar>

      <Paper>{props.response}</Paper>
    </>
  )
}

export async function getServerSideProps(context) {
  const b = context.req.method === 'POST' ? await parse(context.req) : {}

  return {
    props: {
      response: b.SAMLResponse || '',
      relayState: b.RelayState || '',
    },
  }
}
