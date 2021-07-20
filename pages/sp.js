import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import {
  AppBar,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Toolbar,
  Typography,
} from '@material-ui/core'
import axios from 'axios'
import { requestTemplate } from '../lib/templates'
import styles from '../styles/Home.module.css'
import XMLEditor from '../components/XMLEditor'
import { generateId } from '../lib/utils'

export default function SP() {
  const [request, setRequest] = useState(requestTemplate)
  const [signinUrl, setSigninUrl] = useState('')
  const [relayState, setRelayState] = useState(generateId())
  const [binding, setBinding] = useState('redirect')

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

  const generateRedirectUrl = (data) => {
    const url = new URL(signinUrl)
    for (const [key, value] of Object.entries(data)) {
      url.searchParams.append(key, value)
    }
    return url.href
  }

  const submit = async () => {
    try {
      const res = await axios({
        method: 'POST',
        url: '/api/prepareRequest',
        data: {
          request,
          signinUrl,
          relayState,
          binding,
        },
      })

      if (binding === 'redirect') {
        window.location = generateRedirectUrl(res.data)
      } else {
        // Save the info in localStorage, so they could be used by form post script in next page
        localStorage['saml-mock:sp'] = btoa(JSON.stringify(res.data))

        window.location = '/post.html?type=request'
      }
    } catch (e) {
      console.log(e)
      // TODO: show error in UI
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
        {/* Sign-in URL */}
        <Grid item xs={8}>
          <Paper className={styles.paper}>
            <TextField
              fullWidth
              label="Sign-in URL"
              value={signinUrl}
              onChange={(ev) => setSigninUrl(ev.target.value)}
            />
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper className={styles.paper}>
            <TextField
              fullWidth
              label="RelayState"
              value={relayState}
              onChange={(ev) => setRelayState(ev.target.value)}
            />
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper className={styles.paper}>
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
          </Paper>
        </Grid>

        {/* AuthnRequest */}
        <Grid item xs={12}>
          <Paper className={styles.paper}>
            <Typography variant="h6">Request</Typography>
            <XMLEditor xmlStr={request} updateXmlStr={setRequest} />
          </Paper>
        </Grid>
      </Grid>
    </>
  )
}
