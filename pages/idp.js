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
  const [encOpts, setEncOpts] = useState({
    encryptAssertion: !!props.encryptionCert,
    dataEncryptionAlgo: 'aes256-gcm',
    keyEncryptionAlgo: 'rsa-oaep-mgf1p',
    oaepDigestAlgo: 'sha1',
    mgf1DigestAlgo: 'sha1',
    oaepParams: '',
    forceMgf1Mismatch: false,
    encryptionCert: props.encryptionCert || '',
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
          encOpts,
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

        {/* Encryption */}
        <Grid item xs={12}>
          <Paper className={styles.paper}>
            <Typography variant="h6">Encryption</Typography>
            <NoSsr>
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={encOpts.encryptAssertion}
                      onChange={(ev) =>
                        setEncOpts({
                          ...encOpts,
                          encryptAssertion: ev.target.checked,
                        })
                      }
                      disabled={!sendResponse}
                      name="encryptAssertion"
                      color="primary"
                    />
                  }
                  label="Encrypt Assertion"
                />
                <FormControl variant="standard" className={styles.selectWide}>
                  <InputLabel id="data-enc-algo">
                    Data Encryption Algorithm
                  </InputLabel>
                  <Select
                    variant="standard"
                    labelId="data-enc-algo"
                    value={encOpts.dataEncryptionAlgo}
                    onChange={(ev) =>
                      setEncOpts({
                        ...encOpts,
                        dataEncryptionAlgo: ev.target.value,
                      })
                    }
                    disabled={!sendResponse || !encOpts.encryptAssertion}
                    className={styles.selectWide}
                  >
                    <MenuItem value="aes128-cbc">
                      AES-128-CBC (no integrity)
                    </MenuItem>
                    <MenuItem value="aes256-cbc">
                      AES-256-CBC (no integrity)
                    </MenuItem>
                    <MenuItem value="aes128-gcm">
                      AES-128-GCM (recommended)
                    </MenuItem>
                    <MenuItem value="aes256-gcm">
                      AES-256-GCM (recommended)
                    </MenuItem>
                  </Select>
                </FormControl>
                <FormControl variant="standard" className={styles.selectWide}>
                  <InputLabel id="key-enc-algo">
                    Key Encryption Algorithm
                  </InputLabel>
                  <Select
                    variant="standard"
                    labelId="key-enc-algo"
                    value={encOpts.keyEncryptionAlgo}
                    onChange={(ev) =>
                      setEncOpts({
                        ...encOpts,
                        keyEncryptionAlgo: ev.target.value,
                      })
                    }
                    disabled={!sendResponse || !encOpts.encryptAssertion}
                    className={styles.selectWide}
                  >
                    <MenuItem value="rsa-1_5">RSA 1.5</MenuItem>
                    <MenuItem value="rsa-oaep-mgf1p">RSA-OAEP-MGF1P</MenuItem>
                    <MenuItem value="rsa-oaep">RSA-OAEP</MenuItem>
                  </Select>
                </FormControl>
                {encOpts.keyEncryptionAlgo !== 'rsa-1_5' && (
                  <FormControl variant="standard" className={styles.select}>
                    <InputLabel id="oaep-digest-algo">
                      Digest Method Algorithm
                    </InputLabel>
                    <Select
                      variant="standard"
                      labelId="oaep-digest-algo"
                      value={encOpts.oaepDigestAlgo}
                      onChange={(ev) =>
                        setEncOpts({
                          ...encOpts,
                          oaepDigestAlgo: ev.target.value,
                        })
                      }
                      disabled={!sendResponse || !encOpts.encryptAssertion}
                      className={styles.select}
                    >
                      <MenuItem value="sha1">SHA1</MenuItem>
                      <MenuItem value="sha256">SHA256</MenuItem>
                      <MenuItem value="sha512">SHA512</MenuItem>
                    </Select>
                  </FormControl>
                )}
                {/* rsa-oaep-mgf1p pins MGF1 to SHA-1 by definition. */}
                {encOpts.keyEncryptionAlgo === 'rsa-oaep' && (
                  <FormControl variant="standard" className={styles.select}>
                    <InputLabel id="mgf1-digest-algo">
                      MGF1 Digest Algorithm
                    </InputLabel>
                    <Select
                      variant="standard"
                      labelId="mgf1-digest-algo"
                      value={encOpts.mgf1DigestAlgo}
                      onChange={(ev) =>
                        setEncOpts({
                          ...encOpts,
                          mgf1DigestAlgo: ev.target.value,
                        })
                      }
                      disabled={!sendResponse || !encOpts.encryptAssertion}
                      className={styles.select}
                    >
                      <MenuItem value="sha1">SHA1</MenuItem>
                      <MenuItem value="sha256">SHA256</MenuItem>
                      <MenuItem value="sha512">SHA512</MenuItem>
                    </Select>
                  </FormControl>
                )}
                {encOpts.keyEncryptionAlgo !== 'rsa-1_5' && (
                  <TextField
                    variant="standard"
                    className={styles.select}
                    label="OAEP Label"
                    value={encOpts.oaepParams}
                    onChange={(ev) =>
                      setEncOpts({ ...encOpts, oaepParams: ev.target.value })
                    }
                    disabled={!sendResponse || !encOpts.encryptAssertion}
                  />
                )}
              </FormGroup>
              {encOpts.keyEncryptionAlgo === 'rsa-oaep-mgf1p' && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={encOpts.forceMgf1Mismatch}
                      onChange={(ev) =>
                        setEncOpts({
                          ...encOpts,
                          forceMgf1Mismatch: ev.target.checked,
                        })
                      }
                      disabled={!sendResponse || !encOpts.encryptAssertion}
                      name="forceMgf1Mismatch"
                      color="primary"
                    />
                  }
                  label="Emit non-compliant MGF1 (match MGF1 to the digest)"
                />
              )}
              <TextField
                variant="standard"
                fullWidth
                multiline
                minRows={4}
                label="Encryption Certificate (PEM)"
                value={encOpts.encryptionCert}
                onChange={(ev) =>
                  setEncOpts({ ...encOpts, encryptionCert: ev.target.value })
                }
                disabled={!sendResponse || !encOpts.encryptAssertion}
              />
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

  let encryptionCert = ''
  if (q.encryption_cert) {
    try {
      encryptionCert = Buffer.from(q.encryption_cert, 'base64').toString('utf8')
    } catch (e) {
      encryptionCert = ''
    }
  }

  return {
    props: {
      samlreq: b.SAMLRequest || q.SAMLRequest || null,
      relayState: b.RelayState || q.RelayState || '',
      aud: q.aud || '',
      acsUrl: q.acs_url || '',
      encryptionCert,
    },
  }
}