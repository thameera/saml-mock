import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material'
import styles from './InstructionsDialog.module.css'

export default function SPInstructionsDialog({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg">
      <DialogTitle>SP Instructions</DialogTitle>
      <DialogContent>
        <Typography variant="h4" gutterBottom>
          IdP Configuration
        </Typography>
        <Typography>
          1. ACS URL:{' '}
          <span className={styles.code}>https://samlmock.dev/callback</span>
        </Typography>
        <Typography>
          2. (Optional) Sign Out URL:{' '}
          <span className={styles.code}>https://samlmock.dev/callback</span>
        </Typography>
        <Typography>
          3. (Optional) Audience: Any value (eg:{' '}
          <span className={styles.code}>saml-mock</span>)
        </Typography>
        <Typography>
          4. (Optional) Certificate:{' '}
          <Button href="/api/downloadCert" color="primary">
            Download certificate
          </Button>
        </Typography>
        <Typography>
          Certificate can be used by the IdP to validate the SAML Request
          signature.
        </Typography>

        <div className={styles.spacer}></div>
        <Typography variant="h4" gutterBottom>
          Doing a SAML flow
        </Typography>
        <Typography>
          1. Change any variables and request template as necessary.
        </Typography>
        <Typography>2. Click submit on top-right.</Typography>
        <Typography>
          3. Log in at the IdP&#39;s login page if prompted.
        </Typography>
        <Typography>
          4. The callback page will show the received token.
        </Typography>
        <Typography>
          5. Optionally, click the button to inspect the response in
          samltool.io.
        </Typography>
        <Typography>
          6. Optionally, click the Log Out button to send a Logout Request to
          the IdP.
        </Typography>
        <Typography>
          You will be redirected to a screen where you can edit this request.
        </Typography>
      </DialogContent>
    </Dialog>
  )
}
