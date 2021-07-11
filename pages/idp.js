import { useState } from 'react'
import Head from 'next/head'
import {
  AppBar,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid,
  NoSsr,
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
  const [issuer, setIssuer] = useState('saml-mock')
  const [sigOpts, setSigOpts] = useState({
    signAssertion: true,
    signResponse: false,
  })

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
          issuer,
          sigOpts,
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
        {/* SP Attributes */}
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

        {/* IdP Attributes */}
        <Grid item xs={4}>
          <Paper className={styles.paper}>
            <Typography variant="h6">IdP Attributes</Typography>
            <TextField
              fullWidth
              label="Issuer"
              value={issuer}
              onChange={(ev) => setIssuer(ev.target.value)}
            />
          </Paper>
        </Grid>

        {/* Signature */}
        <Grid item xs={12}>
          <Paper className={styles.paper}>
            <Typography variant="h6">Signature</Typography>
            <NoSsr>
              <Grid container>
                <Grid item xs={6}>
                  <FormGroup row>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={sigOpts.signAssertion}
                          onChange={(ev) =>
                            setSigOpts({
                              ...sigOpts,
                              signAssertion: ev.target.checked,
                            })
                          }
                          name="signAssertion"
                          color="primary"
                        />
                      }
                      label="Sign Assertion"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={sigOpts.signResponse}
                          onChange={(ev) =>
                            setSigOpts({
                              ...sigOpts,
                              signResponse: ev.target.checked,
                            })
                          }
                          name="signResponse"
                          color="primary"
                        />
                      }
                      label="Sign Response"
                    />
                  </FormGroup>
                </Grid>
              </Grid>
            </NoSsr>
          </Paper>
        </Grid>

        {/* Response */}
        <Grid item xs={12}>
          <Paper className={styles.paper}>
            <Typography variant="h6">Response</Typography>
            <XMLEditor xmlStr={response} updateXmlStr={setResponse} />
          </Paper>
        </Grid>

        {/* Assertion */}
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
