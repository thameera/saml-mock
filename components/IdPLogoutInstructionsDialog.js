import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material'
import styles from './InstructionsDialog.module.css'

export default function IdPLogoutInstructionsDialog({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg">
      <DialogTitle>IdP Logout Instructions</DialogTitle>
      <DialogContent>
        <Typography variant="h6">Video walkthrough:</Typography>
        <Typography>
          This video uses Auth0 as the Service Provider. The setup would be
          roughly similar for other SPs.
        </Typography>
        <Typography>
          <a href="https://www.youtube.com/watch?v=GJ8Ux0BfLfw" target="_blank" rel="noreferrer">
            https://www.youtube.com/watch?v=GJ8Ux0BfLfw
          </a>
        </Typography>
        <div className={styles.spacer}></div>
        <Typography variant="h6" gutterBottom>
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
        <Typography variant="h6" gutterBottom>
          Doing an SP-initiated SAML Logout flow
        </Typography>
        <Typography>1. Initiate a logout from the SP.</Typography>
        <Typography>
          2. When the Mock IdP Logout screen (this screen) appears, change any
          variables as necessary.
        </Typography>
        <Typography>3. Click Submit button on top-right.</Typography>

        <div className={styles.spacer}></div>
        <Typography variant="h6" gutterBottom>
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
