import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
} from '@material-ui/core'
import styles from './InstructionsDialog.module.css'

export default function IdPLogoutInstructionsDialog({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg">
      <DialogTitle>IdP Logout Instructions</DialogTitle>
      <DialogContent>
        <Typography variant="h4" gutterBottom>
          SP Configuration
        </Typography>
        <Typography>
          1. Sign Out URL:{' '}
          <span className={styles.code}>
            https://samlmock.dev/idp_logout?callback_url=
            <span className={styles.highlight}>SP_LOGOUT_CALLBACK_URL</span>
          </span>
        </Typography>
        <Typography gutterBottom>
          2. (Optional) Certificate:{' '}
          <Button href="/api/downloadCert" color="primary">
            Download certificate
          </Button>
        </Typography>
        <Typography gutterBottom>
          Example sign out URL:{' '}
          <div className={styles.code}>
            https://samlmock.dev/idp_logout?callback_url=https://tham.auth0.com/logout
          </div>
        </Typography>

        <div className={styles.spacer}></div>
        <Typography variant="h4" gutterBottom>
          Doing an SP-initiated SAML Logout flow
        </Typography>
        <Typography>1. Initiate a logout from the SP.</Typography>
        <Typography>
          2. When the Mock IdP Logout screen (this screen) appears, change any
          variables as necessary.
        </Typography>
        <Typography>3. Click Submit button on top-right.</Typography>

        <div className={styles.spacer}></div>
        <Typography variant="h4" gutterBottom>
          Doing an IdP-initiated SAML Logout flow
        </Typography>
        <Typography>
          1. In this page, set the Callback URL and change any variables as
          necessary.
        </Typography>
        <Typography>2. Click Submit button on top-right.</Typography>

        <div className={styles.spacer}></div>
      </DialogContent>
    </Dialog>
  )
}
