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
} from '@mui/material'
import xmlFormat from 'xml-formatter'
import parse from 'urlencoded-body-parser'
import XMLEditor from '../components/XMLEditor'
import styles from '../styles/Home.module.css'
import ErrorNotification from '../components/ErrorNotification'
import xmldom from 'xmldom'

export default function Callback(props) {
  const notificationRef = useRef()

  // Set up logout URL only if this is a login response
  const logoutHref = props.isLogoutResponse
    ? ''
    : `/sp_logout?nameId=${props.nameId}&sessionIndex=${props.sessionIndex}`

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
            color={props.isLogoutResponse ? 'primary' : 'inherit'}
            className={styles.button}
            href="/sp"
          >
            New Login Request
          </Button>
          {!props.isLogoutResponse && (
            <Button
              variant="contained"
              color="primary"
              className={styles.button}
              href={logoutHref}
            >
              SAML Logout
            </Button>
          )}
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
            <Typography variant="p" className={styles.subtitle}>
              This is the raw SAML {props.isLogoutResponse ? 'Logout' : ''}{' '}
              response that was received from your IdP.
            </Typography>
            <TextField
              variant="standard"
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
                variant="standard"
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
            <Typography variant="p" className={styles.subtitle}>
              This is the parsed XML of the SAML{' '}
              {props.isLogoutResponse ? 'Logout' : ''} response that was
              received from your IdP.
            </Typography>
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

    let xml = '',
      nameId = '',
      sessionIndex = '',
      isLogoutResponse = false

    if (b.SAMLResponse) {
      const decoded = Buffer.from(b.SAMLResponse, 'base64').toString()
      xml = xmlFormat(decoded)

      try {
        const dom = new xmldom.DOMParser().parseFromString(decoded)
        if (dom.getElementsByTagName('samlp:LogoutResponse').length > 0) {
          isLogoutResponse = true
        } else {
          nameId =
            dom.getElementsByTagName('saml:NameID')[0]?.childNodes[0]?.nodeValue
          sessionIndex = dom
            .getElementsByTagName('saml:AuthnStatement')[0]
            ?.getAttribute('SessionIndex')
          console.log(`Name ID: ${nameId}, Session Index: ${sessionIndex}`)
        }
      } catch (e) {
        console.log(e)
      }
    }

    return {
      props: {
        response: b.SAMLResponse || '',
        relayState: b.RelayState || null,
        xml,
        isLogoutResponse,
        nameId,
        sessionIndex,
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
