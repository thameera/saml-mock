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
        <Typography gutterBottom>
          2. Certificate:{' '}
          <Button href="/api/downloadCert" color="primary">
            Download certificate
          </Button>
        </Typography>
        <Typography gutterBottom>
          Example sign-in URL:{' '}
          <div className={styles.code}>
            https://saml-mock.vercel.app/idp?aud=urn:auth0:tham:mock-saml&acs_url=https://tham.auth0.com/login/callback
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

        <div className={styles.spacer}></div>
      </DialogContent>
    </Dialog>
  )
}
