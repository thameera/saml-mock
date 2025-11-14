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
  IconButton,
  Input,
  InputAdornment,
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
import CachedIcon from '@mui/icons-material/Cached'
import axios from 'axios'
import XMLEditor from '../components/XMLEditor'
import { assertionTemplate, responseTemplate } from '../lib/templates'
import styles from '../styles/Home.module.css'
import IdPInstructionsDialog from '../components/IdPInstructionsDialog'
import ErrorNotification from '../components/ErrorNotification'
import parse from 'urlencoded-body-parser'

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
    sigAlgo: 'rsa-sha1',
    digestAlgo: 'sha1',
    embedKeyInfo: true,
  })
  const [sendResponse, setSendResponse] = useState(true)
  const [sendRelayState, setSendRelayState] = useState(true)

  const [instructionsOpen, setInstructionsOpen] = useState(false)
  const [prevValues, setPrevValues] = useState({})

  const notificationRef = useRef()

  const STORAGE_KEY = 'saml-mock:idp:data'

  useEffect(() => {
    // At page load, load the previously saved aud and acs url
    const data = localStorage[STORAGE_KEY]
    if (data && data.length > 0) {
      setPrevValues(JSON.parse(data))
    }
  }, [])

  useEffect(() => {
    // Persist ACS URL and audience in localStorage
    // But proceed only if at least one of them is set
    if (acsUrl.length === 0 && aud.length === 0) {
      return
    }
    const data = {
      acsUrl: acsUrl.length > 0 ? acsUrl : prevValues.acsUrl,
      aud: aud.length > 0 ? aud : prevValues.aud,
    }
    localStorage[STORAGE_KEY] = JSON.stringify(data)
  }, [acsUrl, aud])

  /*
   * Button to restore cached ACS URL
   */
  const getAcsUrlAdornment = () => {
    if (
      acsUrl.length > 0 ||
      !prevValues.acsUrl ||
      prevValues.acsUrl.length === 0
    ) {
      return <></>
    }
    return (
      <InputAdornment position="end">
        <Tooltip title="Set previous ACS URL">
          <IconButton onClick={() => setAcsUrl(prevValues.acsUrl)} size="large">
            <CachedIcon />
          </IconButton>
        </Tooltip>
      </InputAdornment>
    )
  }

  /*
   * Button to restore cached Audience
   */
  const getAudAdornment = () => {
    if (aud.length > 0 || !prevValues.aud || prevValues.aud.length === 0) {
      return <></>
    }
    return (
      <InputAdornment position="end">
        <Tooltip title="Set previous Audience">
          <IconButton onClick={() => setAud(prevValues.aud)} size="large">
            <CachedIcon />
          </IconButton>
        </Tooltip>
      </InputAdornment>
    )
  }

  const submit = async () => {
    if (!acsUrl) {
      notificationRef.current.notify('ACS URL cannot be empty')
      return
    }

    try {
      const res = await axios({
        method: 'POST',
        url: '/api/prepareResponse',
        data: {
          ...props,
          assertion,
          response,
          relayState,
          aud,
          acsUrl,
          issuer,
          sigOpts,
          sendResponse,
          sendRelayState,
        },
      })
      // Save the info in localStorage, so they could be used by form post script in next page
      localStorage['saml-mock:idp'] = btoa(JSON.stringify(res.data))
      console.log(res.data.SAMLResponse)

      window.location = '/post.html?type=response'
    } catch (e) {
      console.log(e)
      notificationRef.current.notify(
        'Error generating SAML Response. See console for details.'
      )
    }
  }

  return (
    <>
      <Head>
        <title>SAML Mock IdP</title>
      </Head>

      <AppBar position="sticky" color="transparent">
        <Toolbar>
          <Typography variant="h5" className={styles.header}>
            <Link href="/">SAML Mock</Link> IdP
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
        {/* SP Attributes */}
        <Grid item xs={12}>
          <Alert severity="warning">
            IMPORTANT: SAML Mock&#39;s X509 certificate was updated on
            2024-06-08. If you haven&#39;t updated it in the SP since, please{' '}
            <a href="/api/downloadCert">download the new certificate</a> to
            avoid &#34;Thumbprint mismatch&#34; errors.
          </Alert>
          <Paper className={styles.paper}>
            <Typography variant="h6">SP Attributes</Typography>
            <Grid container>
              <Grid item xs={6}>
                <FormControl variant="standard" fullWidth>
                  <InputLabel htmlFor="acsUrlInput">ACS URL</InputLabel>
                  <Input
                    id="acsUrlInput"
                    fullWidth
                    type="text"
                    value={acsUrl}
                    onChange={(ev) => setAcsUrl(ev.target.value)}
                    endAdornment={getAcsUrlAdornment()}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={3}>
                <FormControl variant="standard" fullWidth>
                  <InputLabel htmlFor="audInput">Audience</InputLabel>
                  <Input
                    id="audInput"
                    fullWidth
                    type="text"
                    value={aud}
                    onChange={(ev) => setAud(ev.target.value)}
                    disabled={!sendResponse}
                    endAdornment={getAudAdornment()}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={3}>
                <TextField
                  variant="standard"
                  fullWidth
                  label="RelayState"
                  value={relayState}
                  onChange={(ev) => setRelayState(ev.target.value)}
                  disabled={!sendRelayState}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* IdP Attributes */}
        <Grid item xs={2}>
          <Paper className={styles.paper}>
            <Typography variant="h6">IdP Attributes</Typography>
            <TextField
              variant="standard"
              fullWidth
              label="Issuer"
              value={issuer}
              onChange={(ev) => setIssuer(ev.target.value)}
              disabled={!sendResponse}
            />
          </Paper>
        </Grid>

        {/* Signature */}
        <Grid item xs={6}>
          <Paper className={styles.paper}>
            <Typography variant="h6">Signature</Typography>
            <NoSsr>
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
                      disabled={!sendResponse}
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
                      disabled={!sendResponse}
                      name="signResponse"
                      color="primary"
                    />
                  }
                  label="Sign Response"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={sigOpts.embedKeyInfo}
                      onChange={(ev) =>
                        setSigOpts({
                          ...sigOpts,
                          embedKeyInfo: ev.target.checked,
                        })
                      }
                      disabled={!sendResponse}
                      name="embedKeyInfo"
                      color="primary"
                    />
                  }
                  label="Embed KeyInfo"
                />
                <FormControl variant="standard" className={styles.select}>
                  <InputLabel id="sig-algo">Signature Algorithm</InputLabel>
                  <Select
                    variant="standard"
                    labelId="sig-algo"
                    value={sigOpts.sigAlgo}
                    onChange={(ev) =>
                      setSigOpts({ ...sigOpts, sigAlgo: ev.target.value })
                    }
                    disabled={!sendResponse}
                    className={styles.select}
                  >
                    <MenuItem value="rsa-sha1">RSA-SHA1</MenuItem>
                    <MenuItem value="rsa-sha256">RSA-SHA256</MenuItem>
                  </Select>
                </FormControl>
                <FormControl variant="standard" className={styles.select}>
                  <InputLabel id="digest-algo">Digest Algorithm</InputLabel>
                  <Select
                    variant="standard"
                    labelId="digest-algo"
                    value={sigOpts.digestAlgo}
                    onChange={(ev) =>
                      setSigOpts({ ...sigOpts, digestAlgo: ev.target.value })
                    }
                    disabled={!sendResponse}
                    className={styles.select}
                  >
                    <MenuItem value="sha1">SHA1</MenuItem>
                    <MenuItem value="sha256">SHA256</MenuItem>
                  </Select>
                </FormControl>
              </FormGroup>
            </NoSsr>
          </Paper>
        </Grid>

        {/* Options */}
        <Grid item xs={4}>
          <Paper className={styles.paper}>
            <Typography variant="h6">Options</Typography>
            <NoSsr>
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={sendResponse}
                      onChange={(ev) => setSendResponse(ev.target.checked)}
                      name="sendResponse"
                      color="primary"
                    />
                  }
                  label="Send Response"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={sendRelayState}
                      onChange={(ev) => setSendRelayState(ev.target.checked)}
                      name="sendRelayState"
                      color="primary"
                    />
                  }
                  label="Send RelayState"
                />
              </FormGroup>
            </NoSsr>
          </Paper>
        </Grid>

        {/* Response */}
        <Grid item xs={12}>
          <Paper className={styles.paper}>
            <Typography variant="h6">Response</Typography>
            <Typography variant="p" className={styles.subtitle}>
              This SAML response will be sent to your SP when you click Submit.
              It will be signed and encoded before it&apos;s sent.
            </Typography>
            <XMLEditor
              xmlStr={response}
              updateXmlStr={setResponse}
              disabled={!sendResponse}
            />
          </Paper>
        </Grid>

        {/* Assertion */}
        <Grid item xs={12}>
          <Paper className={styles.paper}>
            <Typography variant="h6">Assertion</Typography>
            <Typography variant="p" className={styles.subtitle}>
              This SAML assertion will embedded in the {'{'}assertion{'}'}{' '}
              placeholder in the above response after you click Submit.
            </Typography>
            <XMLEditor
              xmlStr={assertion}
              updateXmlStr={setAssertion}
              disabled={!sendResponse}
            />
          </Paper>
        </Grid>
      </Grid>

      <IdPInstructionsDialog
        open={instructionsOpen}
        onClose={() => setInstructionsOpen(false)}
      />

      <ErrorNotification ref={notificationRef} />
    </>
  )
}

export async function getServerSideProps(context) {
  const q = context.query
  const b = context.req.method === 'POST' ? await parse(context.req) : {}

  return {
    props: {
      samlreq: b.SAMLRequest || q.SAMLRequest || null,
      relayState: b.RelayState || q.RelayState || '',
      aud: q.aud || '',
      acsUrl: q.acs_url || '',
    },
  }
}
