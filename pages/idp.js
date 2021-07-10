import { useState } from 'react'
import Head from 'next/head'
import {
  AppBar,
  Button,
  Grid,
  Paper,
  Toolbar,
  Typography,
} from '@material-ui/core'
import axios from 'axios'
import XMLEditor from '../components/XMLEditor'
import { assertionTemplate } from '../lib/templates'
import styles from '../styles/IdP.module.css'

export default function IdP(props) {
  const [assertion, setAssertion] = useState(assertionTemplate)

  const submit = async () => {
    try {
      const res = await axios({
        method: 'POST',
        url: '/api/continue',
        data: {
          assertion,
          ...props,
        },
      })
      console.log(res)
    } catch (e) {
      console.log(e)
      // TODO: show error in UI
    }
  }

  return (
    <>
      <Head>
        <title>SAML Mock IdP</title>
      </Head>

      <AppBar position="sticky" color="transparent">
        <Toolbar>
          <Typography variant="h5">SAML Mock IdP</Typography>
          <div className={styles.grow} />
          <Button variant="contained" color="primary" onClick={submit}>
            Submit
          </Button>
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

export async function getServerSideProps(context) {
  const q = context.query

  return {
    props: {
      samlreq: q.SAMLRequest || null,
      relaystate: q.RelayState || '',
      aud: q.aud || '',
      acsUrl: q.acs_url || '',
    },
  }
}
