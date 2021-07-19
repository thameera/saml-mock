import {
  AppBar,
  Card,
  CardContent,
  Container,
  Grid,
  Toolbar,
  Typography,
} from '@material-ui/core'
import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <>
      <Head>
        <title>SAML Mock</title>
      </Head>

      <AppBar position="sticky" color="transparent">
        <Toolbar>
          <Typography variant="h5" className={styles.header}>
            <Link href="/">SAML Mock</Link>
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" className={styles.buttonContainer}>
        <Grid container direction="row" spacing={2}>
          <Grid item xs={6}>
            <Link href="/idp">
              <Card variant="outlined" className={styles.cardLink}>
                <CardContent>
                  <Typography gutterBottom variant="h5">
                    SAML IdP
                  </Typography>
                  <Typography>A mock SAML Identity Provider</Typography>
                </CardContent>
              </Card>
            </Link>
          </Grid>
          <Grid item xs={6}>
            <Link href="/sp">
              <Card variant="outlined" className={styles.cardLink}>
                <CardContent>
                  <Typography gutterBottom variant="h5">
                    SAML SP
                  </Typography>
                  <Typography>A mock SAML Service Provider</Typography>
                </CardContent>
              </Card>
            </Link>
          </Grid>
        </Grid>
      </Container>
    </>
  )
}
