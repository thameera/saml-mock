import { Box, Container, Typography } from '@material-ui/core'
import Head from 'next/head'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <Container maxWidth="sm">
      <Head>
        <title>SAML Mock</title>
      </Head>

      <Typography variant="h3">SAML Mock</Typography>
    </Container>
  )
}
