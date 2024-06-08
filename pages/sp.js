import { useEffect, useRef, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import {
  Alert,
  AppBar,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  InputLabel,
  MenuItem,
  NoSsr,
  Paper,
  Select,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import axios from 'axios'
import { requestTemplate } from '../lib/templates'
import styles from '../styles/Home.module.css'
import XMLEditor from '../components/XMLEditor'
import { generateId, generateRedirectUrl } from '../lib/utils'
import SPInstructionsDialog from '../components/SPInstructionsDialog'
import ErrorNotification from '../components/ErrorNotification'

export default function SP() {
  const [request, setRequest] = useState(requestTemplate)
  const [signinUrl, setSigninUrl] = useState('')
  const [relayState, setRelayState] = useState(generateId())
  const [binding, setBinding] = useState('redirect')
  const [sigOpts, setSigOpts] = useState({
    signRequest: true,
    sigAlgo: 'rsa-sha1',
    digestAlgo: 'sha1',
  })
  const [sendRequest, setSendRequest] = useState(true)
  const [sendRelayState, setSendRelayState] = useState(true)

  const [instructionsOpen, setInstructionsOpen] = useState(false)

  const notificationRef = useRef()

  const STORAGE_KEY = 'saml-mock:sp:url'

  useEffect(() => {
    // Load saved sign-in URL
    const url = localStorage[STORAGE_KEY]
    if (url) {
      setSigninUrl(url)
    }
  }, [])

  useEffect(() => {
    // Persist any changes to sign-in URL in localStorage
    localStorage[STORAGE_KEY] = signinUrl
  }, [signinUrl])

  const submit = async () => {
    if (!signinUrl) {
      notificationRef.current.notify('Sign-in URL cannot be empty')
      return
    }

    try {
      const res = await axios({
        method: 'POST',
        url: '/api/prepareRequest',
        data: {
          request,
          signinUrl,
          relayState,
          binding,
          sigOpts,
          sendRequest,
          sendRelayState,
        },
      })

      console.log(res.data.SAMLRequest)

      if (binding === 'redirect') {
        window.location = generateRedirectUrl(signinUrl, res.data)
      } else {
        const data = { ...res.data, signinUrl }
        // Save the info in localStorage, so they could be used by form post script in next page
        localStorage['saml-mock:sp'] = btoa(JSON.stringify(data))

        window.location = '/post.html?type=request'
      }
    } catch (e) {
      console.log(e)
      notificationRef.current.notify(
        'Error generating SAML Request. See console for details.'
      )
    }
  }

  return (
    <>
      <Head>
        <title>SAML Mock SP</title>
      </Head>

      <AppBar position="sticky" color="transparent">
        <Toolbar>
          <Typography variant="h5" className={styles.header}>
            <Link href="/">SAML Mock</Link> SP
          </Typography>
          <Button
            variant="outlined"
            className={styles.button}
            onClick={() => setInstructionsOpen(true)}
          >
            Instructions
          </Button>
          <div className={styles.grow} />
          <Button
            variant="contained"
            color="primary"
            onClick={submit}
            className={styles.button}
          >
            Submit
          </Button>
        </Toolbar>
      </AppBar>

      <Grid container>
        <Grid item xs={12}>
          <Alert severity="warning">
            IMPORTANT: SAML Mock&#39;s X509 certificate was updated on
            2024-06-08. If you have uploaded it to the IdP and haven&#39;t
            updated it since, please{' '}
            <a href="/api/downloadCert">download the new certificate</a> to
            avoid &#34;Thumbprint mismatch&#34; errors.
          </Alert>
        </Grid>
        {/* Sign-in URL */}
        <Grid item xs={8}>
          <Paper className={styles.paper}>
            <TextField
              variant="standard"
              fullWidth
              label="Sign-in URL"
              value={signinUrl}
              onChange={(ev) => setSigninUrl(ev.target.value)}
            />
          </Paper>
        </Grid>
        {/* RelayState */}
        <Grid item xs={4}>
          <Paper className={styles.paper}>
            <TextField
              variant="standard"
              fullWidth
              disabled={!sendRelayState}
              label="RelayState"
              value={relayState}
              onChange={(ev) => setRelayState(ev.target.value)}
            />
          </Paper>
        </Grid>

        {/* Signature */}
        <Grid item xs={6}>
          <Paper className={styles.paper}>
            <Typography variant="h6">Signature</Typography>
            <NoSsr>
              <FormGroup row>
                {/* Sign Request? */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={sigOpts.signRequest}
                      onChange={(ev) =>
                        setSigOpts({
                          ...sigOpts,
                          signRequest: ev.target.checked,
                        })
                      }
                      disabled={!sendRequest}
                      name="signRequest"
                      color="primary"
                    />
                  }
                  label="Sign Request"
                />
                {/* Signature Algo */}
                <FormControl
                  variant="standard"
                  className={styles.select}
                  disabled={!sendRequest}
                >
                  <InputLabel id="sig-algo">Signature Algorithm</InputLabel>
                  <Select
                    variant="standard"
                    labelId="sig-algo"
                    value={sigOpts.sigAlgo}
                    onChange={(ev) =>
                      setSigOpts({ ...sigOpts, sigAlgo: ev.target.value })
                    }
                    className={styles.select}
                  >
                    <MenuItem value="rsa-sha1">RSA-SHA1</MenuItem>
                    <MenuItem value="rsa-sha256">RSA-SHA256</MenuItem>
                  </Select>
                </FormControl>
                {/* Digest Algo */}
                <Tooltip
                  title={
                    binding === 'redirect' && sendRequest
                      ? 'No digest calculated in Redirect binding'
                      : ''
                  }
                  placement="top"
                >
                  <FormControl
                    variant="standard"
                    className={styles.select}
                    disabled={binding === 'redirect'}
                  >
                    <InputLabel id="digest-algo">Digest Algorithm</InputLabel>
                    <Select
                      variant="standard"
                      labelId="digest-algo"
                      value={sigOpts.digestAlgo}
                      onChange={(ev) =>
                        setSigOpts({ ...sigOpts, digestAlgo: ev.target.value })
                      }
                      className={styles.select}
                    >
                      <MenuItem value="sha1">SHA1</MenuItem>
                      <MenuItem value="sha256">SHA256</MenuItem>
                    </Select>
                  </FormControl>
                </Tooltip>
              </FormGroup>
            </NoSsr>
          </Paper>
        </Grid>

        {/* Options */}
        <Grid item xs={6}>
          <Paper className={styles.paper}>
            <Typography variant="h6">Options</Typography>
            <NoSsr>
              {/* Binding */}
              <FormControl variant="standard" className={styles.select}>
                <InputLabel id="binding">Request Binding</InputLabel>
                <Select
                  variant="standard"
                  labelId="binding"
                  value={binding}
                  onChange={(ev) => setBinding(ev.target.value)}
                  className={styles.select}
                >
                  <MenuItem value="redirect">HTTP-Redirect</MenuItem>
                  <MenuItem value="post">HTTP-Post</MenuItem>
                </Select>
              </FormControl>
              {/* Send Request */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={sendRequest}
                    onChange={(ev) => setSendRequest(ev.target.checked)}
                    name="sendRequest"
                    color="primary"
                  />
                }
                label="Send Request"
              />
              {/* Send RelayState */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={sendRelayState}
                    onChange={(ev) => setSendRelayState(ev.target.checked)}
                    name="sendRequest"
                    color="primary"
                  />
                }
                label="Send RelayState"
              />
            </NoSsr>
          </Paper>
        </Grid>

        {/* AuthnRequest */}
        <Grid item xs={12}>
          <Paper className={styles.paper}>
            <Typography variant="h6">Request</Typography>
            <Typography variant="p" className={styles.subtitle}>
              This SAML request will be sent to your IdP when you click Submit.
              It will be signed and encoded before it&apos;s sent.
            </Typography>
            <XMLEditor
              xmlStr={request}
              updateXmlStr={setRequest}
              disabled={!sendRequest}
            />
          </Paper>
        </Grid>
      </Grid>

      <SPInstructionsDialog
        open={instructionsOpen}
        onClose={() => setInstructionsOpen(false)}
      />

      <ErrorNotification ref={notificationRef} />
    </>
  )
}
