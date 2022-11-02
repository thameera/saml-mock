import { useEffect, useRef } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import {
  AppBar,
  Button,
  Grid,
  Paper,
  TextField,
  Toolbar,
  Typography,
} from '@material-ui/core'
import xmlFormat from 'xml-formatter'
import parse from 'urlencoded-body-parser'
import XMLEditor from '../components/XMLEditor'
import styles from '../styles/Home.module.css'
import ErrorNotification from '../components/ErrorNotification'

export default function Callback(props) {
  const notificationRef = useRef()

  // If there are errors during load, show error notification
  useEffect(() => {
    if (props.err) {
      console.log(props.err)
      notificationRef.current.notify(
        'There were errors parsing the response. See console for details.'
      )
    }
  }, [])

  const sendToSamltool = () => {
    const data = { SAMLResponse: props.response }
    localStorage['saml-mock:samltool'] = btoa(JSON.stringify(data))

    window.open('/post.html?type=samltool', '_blank').focus()
  }

  return (
    <>
      <Head>
        <title>SAML Mock Callback</title>
      </Head>

      <AppBar position="sticky" color="transparent">
        <Toolbar>
          <Typography variant="h5" className={styles.header}>
            <Link href="/">SAML Mock</Link> Callback
          </Typography>
          <div className={styles.grow} />
          <Button
            variant="contained"
            color="primary"
            className={styles.button}
            href="/sp"
          >
            New Request
          </Button>
        </Toolbar>
      </AppBar>

      <Grid container>
        <Grid item xs={12}>
          <Paper className={styles.paper}>
            <Button
              variant="outlined"
              color="primary"
              className={styles.button}
              onClick={sendToSamltool}
            >
              Open in SamlTool.io ↗
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper className={styles.paper}>
            <Typography variant="h6">SAML Response</Typography>
            <TextField
              fullWidth
              value={props.response}
              multiline
              maxRows={4}
              InputProps={{ readOnly: true }}
            />
          </Paper>
        </Grid>
        <Grid item xs={3}>
          <Paper className={styles.paper}>
            <Typography variant="h6">RelayState</Typography>
            {props.relayState ? (
              <TextField
                fullWidth
                value={props.relayState}
                multiline
                maxRows={4}
                InputProps={{ readOnly: true }}
              />
            ) : (
              'No RelayState received'
            )}
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper className={styles.paper}>
            <Typography variant="h6">Parsed XML</Typography>
            <XMLEditor xmlStr={props.xml} />
          </Paper>
        </Grid>
      </Grid>

      <ErrorNotification ref={notificationRef} />
    </>
  )
}

export async function getServerSideProps(context) {
  try {
    const b =
      context.req.method === 'POST' ? await parse(context.req) : context.query

    let xml = ''
    if (b.SAMLResponse) {
      const decoded = Buffer.from(b.SAMLResponse, 'base64').toString()
      xml = xmlFormat(decoded)
    }

    return {
      props: {
        response: b.SAMLResponse || '',
        relayState: b.RelayState || null,
        xml,
      },
    }
  } catch (e) {
    return {
      props: {
        err: e,
      },
    }
  }
}
