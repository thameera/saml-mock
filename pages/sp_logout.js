import { useEffect, useRef, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import {
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
} from '@material-ui/core'
import axios from 'axios'
import styles from '../styles/Home.module.css'
import { logoutRequestTemplate } from '../lib/templates'
import XMLEditor from '../components/XMLEditor'
import ErrorNotification from '../components/ErrorNotification'
import { generateId, generateRedirectUrl } from '../lib/utils'
import { useRouter } from 'next/router'
import SPLogoutInstructionsDialog from '../components/SPLogoutInstructionsDialog'

export default function SPLogout(props) {
  const [request, setRequest] = useState(logoutRequestTemplate)
  const [logoutUrl, setLogoutUrl] = useState('')
  const [relayState, setRelayState] = useState(generateId())
  const [binding, setBinding] = useState('redirect')
  const [sigOpts, setSigOpts] = useState({
    signRequest: true,
    sigAlgo: 'rsa-sha1',
    digestAlgo: 'sha1',
  })
  const [sendRelayState, setSendRelayState] = useState(false)

  const [instructionsOpen, setInstructionsOpen] = useState(false)

  const notificationRef = useRef()
  const router = useRouter()

  const STORAGE_KEY = 'saml-mock:sp_logout:url'

  useEffect(() => {
    // Load saved logout URL
    const url = localStorage[STORAGE_KEY]
    if (url) {
      setLogoutUrl(url)
    }
  }, [])

  useEffect(() => {
    // Persist any changes to logout URL in localStorage
    localStorage[STORAGE_KEY] = logoutUrl
  }, [logoutUrl])

  useEffect(() => {
    console.log(router.query)
    const { nameId, sessionIndex } = router.query
    let template = logoutRequestTemplate
    if (nameId) {
      template = template.replace('ENTER_NAME_ID_HERE', nameId)
    }
    if (sessionIndex) {
      template = template.replace('ENTER_SESSION_INDEX_HERE', sessionIndex)
    }
    setRequest(template)
  }, [router.query])

  const submit = async () => {
    if (!logoutUrl) {
      notificationRef.current.notify('Logout URL cannot be empty')
      return
    }

    try {
      const res = await axios({
        method: 'POST',
        url: '/api/prepareLogoutRequest',
        data: {
          request,
          logoutUrl,
          relayState,
          binding,
          sigOpts,
          sendRelayState,
        },
      })

      console.log(res.data.SAMLRequest)

      if (binding === 'redirect') {
        window.location = generateRedirectUrl(logoutUrl, res.data)
      } else {
        const data = { ...res.data, logoutUrl }
        // Save the info in localStorage, so they could be used by form post script in next page
        localStorage['saml-mock:sp_logout'] = btoa(JSON.stringify(data))

        window.location = '/post.html?type=logout_request'
      }
    } catch (e) {
      console.log(e)
      notificationRef.current.notify(
        'Error generating SAML Logout Request. See console for details.'
      )
    }
  }

  return (
    <>
      <Head>
        <title>SAML Mock SP: Logout</title>
      </Head>

      <AppBar position="sticky" color="transparent">
        <Toolbar>
          <Typography variant="h5" className={styles.header}>
            <Link href="/">SAML Mock</Link> SP: Logout
          </Typography>
          <Button
            variant="outlined"
            color="default"
            className={styles.button}
            onClick={() => setInstructionsOpen(true)}
          >
            Instructions
          </Button>
          <div className={styles.grow} />
          <Button
            variant="contained"
            color="default"
            className={styles.button}
            href="/sp"
          >
            Back to SP
          </Button>
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
        {/* Logout URL */}
        <Grid item xs={8}>
          <Paper className={styles.paper}>
            <TextField
              fullWidth
              label="IdP Logout URL"
              value={logoutUrl}
              onChange={(ev) => setLogoutUrl(ev.target.value)}
            />
          </Paper>
        </Grid>
        {/* RelayState */}
        <Grid item xs={4}>
          <Paper className={styles.paper}>
            <TextField
              fullWidth
              disabled={!sendRelayState}
              label="RelayState (optional)"
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
                      name="signRequest"
                      color="primary"
                    />
                  }
                  label="Sign Request"
                />
                {/* Signature Algo */}
                <FormControl className={styles.select}>
                  <InputLabel id="sig-algo">Signature Algorithm</InputLabel>
                  <Select
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
                    binding === 'redirect'
                      ? 'No digest calculated in Redirect binding'
                      : ''
                  }
                  placement="top"
                >
                  <FormControl
                    className={styles.select}
                    disabled={binding === 'redirect'}
                  >
                    <InputLabel id="digest-algo">Digest Algorithm</InputLabel>
                    <Select
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
              <FormControl className={styles.select}>
                <InputLabel id="binding">Request Binding</InputLabel>
                <Select
                  labelId="binding"
                  value={binding}
                  onChange={(ev) => setBinding(ev.target.value)}
                  className={styles.select}
                >
                  <MenuItem value="redirect">HTTP-Redirect</MenuItem>
                  <MenuItem value="post">HTTP-Post</MenuItem>
                </Select>
              </FormControl>
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

        {/* LogoutRequest */}
        <Grid item xs={12}>
          <Paper className={styles.paper}>
            <Typography variant="h6">Request</Typography>
            <Typography variant="p" className={styles.subtitle}>
              This logout request will be sent to your IdP when you click
              Submit. It will be signed and encoded before it&apos;s sent.
            </Typography>
            <XMLEditor xmlStr={request} updateXmlStr={setRequest} />
          </Paper>
        </Grid>
      </Grid>

      <SPLogoutInstructionsDialog
        open={instructionsOpen}
        onClose={() => setInstructionsOpen(false)}
      />

      <ErrorNotification ref={notificationRef} />
    </>
  )
}
