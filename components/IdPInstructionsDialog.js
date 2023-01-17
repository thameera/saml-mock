import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
} from '@material-ui/core'
import styles from './InstructionsDialog.module.css'

export default function IdPInstructionsDialog({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg">
      <DialogTitle>IdP Instructions</DialogTitle>
      <DialogContent>
        <Typography variant="h4" gutterBottom>
          SP Configuration
        </Typography>
        <Typography>
          1. Sign-in URL:{' '}
          <span className={styles.code}>
            https://saml-mock.vercel.app/idp?aud=
            <span className={styles.highlight}>SP_AUDIENCE</span>&acs_url=
            <span className={styles.highlight}>SP_ACS_URL</span>
          </span>
        </Typography>
        <Typography>
          1. (Optional) Sign Out URL:{' '}
          <span className={styles.code}>
            https://saml-mock.vercel.app/idp_logout?callback_url=
            <span className={styles.highlight}>SP_LOGOUT_CALLBACK_URL</span>
          </span>
        </Typography>
        <Typography gutterBottom>
          2. Certificate:{' '}
          <Button href="/api/downloadCert" color="primary">
            Download certificate
          </Button>
        </Typography>
        <Typography>
          Example sign-in URL:{' '}
          <div className={styles.code}>
            https://saml-mock.vercel.app/idp?aud=urn:auth0:tham:mock-saml&acs_url=https://tham.auth0.com/login/callback
          </div>
        </Typography>
        <Typography gutterBottom>
          Example sign out URL:{' '}
          <div className={styles.code}>
            https://saml-mock.vercel.app/idp_logout?callback_url=https://tham.auth0.com/logout
          </div>
        </Typography>

        <div className={styles.spacer}></div>
        <Typography variant="h4" gutterBottom>
          Doing a SAML flow
        </Typography>
        <Typography>1. Initiate a login from the SP.</Typography>
        <Typography>
          2. When the Mock IdP screen appears, change any variables as
          necessary.
        </Typography>
        <Typography>3. Click Submit button on top-right.</Typography>
        <Typography>
          4. Optionally, send a logout request from the SP afterwards to
          simulate SAML logout.
        </Typography>

        <div className={styles.spacer}></div>
      </DialogContent>
    </Dialog>
  )
}
