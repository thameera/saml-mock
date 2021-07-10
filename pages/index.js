import Head from 'next/head'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>SAML Mock</title>
        <meta name="description" content="SAML Mock SP and IdP" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>SAML Mock</h1>
      </main>
    </div>
  )
}
