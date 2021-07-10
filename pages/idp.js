import { useState } from 'react'
import Head from 'next/head'
import { AppBar, Grid, Paper, Toolbar, Typography } from '@material-ui/core'
import XMLEditor from '../components/XMLEditor'
import { assertionTemplate } from '../lib/templates'
import styles from '../styles/IdP.module.css'

export default function Home() {
  const [assertion, setAssertion] = useState(assertionTemplate)

  return (
    <>
      <Head>
        <title>SAML Mock IdP</title>
      </Head>

      <AppBar position="sticky" color="transparent">
        <Toolbar>
          <Typography variant="h5">SAML Mock IdP</Typography>
        </Toolbar>
      </AppBar>

      <Grid container>
        <Grid item xs={12}>
          <Paper className={styles.paper}>
            <Typography variant="h6">Assertion</Typography>
            <XMLEditor xmlStr={assertion} updateXmlStr={setAssertion} />
          </Paper>
        </Grid>
      </Grid>
    </>
  )
}
