import { useState } from 'react'
import Head from 'next/head'
import {
  AppBar,
  Button,
  Grid,
  Paper,
  TextField,
  Toolbar,
  Typography,
} from '@material-ui/core'
import axios from 'axios'
import XMLEditor from '../components/XMLEditor'
import { assertionTemplate, responseTemplate } from '../lib/templates'
import styles from '../styles/IdP.module.css'

export default function IdP(props) {
  const [assertion, setAssertion] = useState(assertionTemplate)
  const [response, setResponse] = useState(responseTemplate)
  const [relayState, setRelayState] = useState(props.relayState)
  const [aud, setAud] = useState(props.aud)
  const [acsUrl, setAcsUrl] = useState(props.acsUrl)

  const submit = async () => {
    try {
      const res = await axios({
        method: 'POST',
        url: '/api/continue',
        data: {
          ...props,
          assertion,
          response,
          relayState,
          aud,
          acsUrl,
        },
      })
      // Save the info in localStorage, so they could be used by form post script in next page
      localStorage['saml-mock:idp'] = btoa(JSON.stringify(res.data))

      window.location = '/postResponse.html'
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
            <Typography variant="h6">SP Attributes</Typography>
            <Grid container>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="RelayState"
                  value={relayState}
                  onChange={(ev) => setRelayState(ev.target.value)}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Audience"
                  value={aud}
                  onChange={(ev) => setAud(ev.target.value)}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="ACS URL"
                  value={acsUrl}
                  onChange={(ev) => setAcsUrl(ev.target.value)}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper className={styles.paper}>
            <Typography variant="h6">Response</Typography>
            <XMLEditor xmlStr={response} updateXmlStr={setResponse} />
          </Paper>
        </Grid>
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
  // TODO: show warnings when aud or acsUrl isn't present

  return {
    props: {
      samlreq: q.SAMLRequest || null,
      relayState: q.RelayState || '',
      aud: q.aud || '',
      acsUrl: q.acs_url || '',
    },
  }
}