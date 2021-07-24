import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
} from '@material-ui/core'
import styles from './InstructionsDialog.module.css'

export default function SPInstructionsDialog({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg">
      <DialogTitle>Instructions</DialogTitle>
      <DialogContent>
        <Typography variant="h4" gutterBottom>
          IdP Configuration
        </Typography>
        <Typography>
          ACS URL:{' '}
          <span className={styles.code}>
            https://saml-mock.vercel.app/callback
          </span>
        </Typography>
        <Typography>
          Audience (Optional): Any value (eg:{' '}
          <span className={styles.code}>saml-mock</span>)
        </Typography>
        <Typography>
          Certificate (Optional):{' '}
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
      </DialogContent>
    </Dialog>
  )
}
