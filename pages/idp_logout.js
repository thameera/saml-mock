import { useEffect, useRef, useState } from 'react'
import {
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
import Head from 'next/head'
import Link from 'next/link'
import { logoutResponseTemplate } from '../lib/templates'
import styles from '../styles/Home.module.css'
import XMLEditor from '../components/XMLEditor'
import ErrorNotification from '../components/ErrorNotification'
import axios from 'axios'
import { generateRedirectUrl } from '../lib/utils'
import IdPLogoutInstructionsDialog from '../components/IdPLogoutInstructionsDialog'

export default function IdpLogout(props) {
  const [response, setResponse] = useState(logoutResponseTemplate)
  const [relayState, setRelayState] = useState(props.relayState)
  const [callbackUrl, setCallbackUrl] = useState(props.callbackUrl)
  const [issuer, setIssuer] = useState('saml-mock')
  const [sigOpts, setSigOpts] = useState({
    signResponse: false,
    sigAlgo: 'rsa-sha1',
    digestAlgo: 'sha1',
  })
  const [binding, setBinding] = useState('post')
  const [sendResponse, setSendResponse] = useState(true)
  const [sendRelayState, setSendRelayState] = useState(!!props.relayState)

  const [prevValues, setPrevValues] = useState({})
  const [instructionsOpen, setInstructionsOpen] = useState(false)

  const notificationRef = useRef()

  const STORAGE_KEY = 'saml-mock:idp_logout:data'

  useEffect(() => {
    // At page load, load the previously saved callback url
    const data = localStorage[STORAGE_KEY]
    if (data && data.length > 0) {
      setPrevValues(JSON.parse(data))
    }
  }, [])

  useEffect(() => {
    // Persist Callback URL in localStorage
    if (callbackUrl.length === 0) {
      return
    }
    const data = { callbackUrl }
    localStorage[STORAGE_KEY] = JSON.stringify(data)
  }, [callbackUrl])

  /*
   * Button to restore cached Callback URL
   */
  const getCallbackUrlAdornment = () => {
    if (
      callbackUrl.length > 0 ||
      !prevValues.callbackUrl ||
      prevValues.callbackUrl.length === 0
    ) {
      return <></>
    }
    return (
      <InputAdornment position="end">
        <Tooltip title="Set previous Callback URL">
          <IconButton
            onClick={() => setCallbackUrl(prevValues.callbackUrl)}
            size="large"
          >
            <CachedIcon />
          </IconButton>
        </Tooltip>
      </InputAdornment>
    )
  }

  const submit = async () => {
    if (!callbackUrl) {
      notificationRef.current.notify('Callback URL cannot be empty')
      return
    }

    try {
      const res = await axios({
        method: 'POST',
        url: '/api/prepareLogoutResponse',
        data: {
          ...props,
          callbackUrl,
          response,
          issuer,
          sigOpts,
          binding,
          sendResponse,
          sendRelayState,
        },
      })
      console.log(res.data.SAMLResponse)

      if (binding === 'redirect') {
        window.location = generateRedirectUrl(callbackUrl, res.data)
      } else {
        const data = { ...res.data, callbackUrl }
        // Save the info in localStorage, so they could be used by form post script in next page
        localStorage['saml-mock:idp_logout'] = btoa(JSON.stringify(data))

        window.location = '/post.html?type=logout_response'
      }
    } catch (e) {
      console.log(e)
      notificationRef.current.notify(
        'Error generating Logout Response. See console for details.'
      )
    }
  }

  return (
    <>
      <Head>
        <title>SAML Mock IdP: Logout</title>
      </Head>

      <AppBar position="sticky" color="transparent">
        <Toolbar>
          <Typography variant="h5" className={styles.header}>
            <Link href="/">SAML Mock</Link> IdP: Logout
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
          <Paper className={styles.paper}>
            <Typography variant="h6">SP Attributes</Typography>
            <Grid container>
              <Grid item xs={8}>
                <FormControl variant="standard" fullWidth>
                  <InputLabel htmlFor="callbackUrlInput">
                    Callback URL
                  </InputLabel>
                  <Input
                    id="callbackUrlInput"
                    fullWidth
                    type="text"
                    value={callbackUrl}
                    onChange={(ev) => setCallbackUrl(ev.target.value)}
                    endAdornment={getCallbackUrlAdornment()}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={4}>
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
        <Grid item xs={5}>
          <Paper className={styles.paper}>
            <Typography variant="h6">Signature</Typography>
            <NoSsr>
              <FormGroup row>
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
                <FormControl variant="standard" className={styles.select}>
                  <InputLabel id="sig-algo">Signature Algorithm</InputLabel>
                  <Select
                    variant="standard"
                    labelId="sig-algo"
                    value={sigOpts.sigAlgo}
                    onChange={(ev) =>
                      setSigOpts({ ...sigOpts, sigAlgo: ev.target.value })
                    }
                    disabled={!sendResponse || !sigOpts.signResponse}
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
                    disabled={!sendResponse || !sigOpts.signResponse}
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
        <Grid item xs={5}>
          <Paper className={styles.paper}>
            <Typography variant="h6">Options</Typography>
            <NoSsr>
              <FormGroup row>
                <FormControl variant="standard" className={styles.select}>
                  <InputLabel id="binding">Response Binding</InputLabel>
                  <Select
                    variant="standard"
                    labelId="binding"
                    value={binding}
                    onChange={(ev) => setBinding(ev.target.value)}
                    disabled={!sendResponse && !sendRelayState}
                    className={styles.select}
                  >
                    <MenuItem value="post">HTTP-POST</MenuItem>
                    <MenuItem value="redirect">HTTP-Redirect</MenuItem>
                  </Select>
                </FormControl>
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
              This Logout response will be sent to your SP when you click
              Submit. It will be signed and encoded before it&apos;s sent.
            </Typography>
            <XMLEditor
              xmlStr={response}
              updateXmlStr={setResponse}
              disabled={!sendResponse}
            />
          </Paper>
        </Grid>
      </Grid>

      <IdPLogoutInstructionsDialog
        open={instructionsOpen}
        onClose={() => setInstructionsOpen(false)}
      />

      <ErrorNotification ref={notificationRef} />
    </>
  )
}

export async function getServerSideProps(context) {
  const q = context.query

  return {
    props: {
      logoutreq: q.SAMLRequest || '',
      relayState: q.RelayState || '',
      callbackUrl: q.callback_url || '',
    },
  }
}
