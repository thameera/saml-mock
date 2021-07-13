import { useEffect, useState } from 'react'
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
import { requestTemplate } from '../lib/templates'
import styles from '../styles/Home.module.css'
import XMLEditor from '../components/XMLEditor'

export default function SP() {
  const [request, setRequest] = useState(requestTemplate)
  const [signinUrl, setSigninUrl] = useState('')

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
    for (const [key, value] of Object.entries(data.qs)) {
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
        },
      })

      window.location = generateRedirectUrl(res.data)
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
          <Typography variant="h5">SAML Mock SP</Typography>
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
        <Grid item xs={12}>
          <Paper className={styles.paper}>
            <TextField
              fullWidth
              label="Sign-in URL"
              value={signinUrl}
              onChange={(ev) => setSigninUrl(ev.target.value)}
            />
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
