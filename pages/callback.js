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
import xmlFormat from 'xml-formatter'
import parse from 'urlencoded-body-parser'
import styles from '../styles/Home.module.css'
import XMLEditor from '../components/XMLEditor'

export default function Callback(props) {
  const sendToSamltool = () => {
    const data = { SAMLResponse: props.response }
    localStorage['saml-mock:samltool'] = btoa(JSON.stringify(data))

    window.open('/post.html?type=samltool', '_blank').focus()
  }

  return (
    <>
      <Head>
        <title>SAML Mock SP</title>
      </Head>

      <AppBar position="sticky" color="transparent">
        <Toolbar>
          <Typography variant="h5">SAML Mock Callback</Typography>
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
        <Grid item xs={12}>
          <Paper className={styles.paper}>
            <Typography variant="h6">Parsed XML</Typography>
            <XMLEditor xmlStr={props.xml} />
          </Paper>
        </Grid>
      </Grid>
    </>
  )
}

export async function getServerSideProps(context) {
  // TODO: error handle, support GET
  const b = context.req.method === 'POST' ? await parse(context.req) : {}

  let xml = ''
  if (b.SAMLResponse) {
    const decoded = Buffer.from(b.SAMLResponse, 'base64').toString()
    xml = xmlFormat(decoded)
  }

  return {
    props: {
      response: b.SAMLResponse || '',
      relayState: b.RelayState || '',
      xml,
    },
  }
}
