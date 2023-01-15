import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
} from '@material-ui/core'
import styles from './InstructionsDialog.module.css'

export default function SPLogoutInstructionsDialog({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg">
      <DialogTitle>SP Logout Instructions</DialogTitle>
      <DialogContent>
        <Typography variant="h4" gutterBottom>
          IdP Configuration
        </Typography>
        <Typography>
          1. SAML Logout callback URL:{' '}
          <span className={styles.code}>
            https://saml-mock.vercel.app/callback
          </span>
        </Typography>
        <Typography>
          2. (Optional) Certificate:{' '}
          <Button href="/api/downloadCert" color="primary">
            Download certificate
          </Button>
        </Typography>
        <Typography>
          Certificate can be used by the IdP to validate the SAML Logout Request
          signature.
        </Typography>

        <div className={styles.spacer}></div>
        <Typography variant="h4" gutterBottom>
          Doing an SP-initiated SAML Logout flow
        </Typography>
        <Typography>
          When you log in via SAML Mock SP, you will get a button to initiate a
          Logout.
        </Typography>
        <Typography>
          The NameID and the SessionIndex will be automatically filled for you,
          but you can edit them to test breaking scenarios.
        </Typography>
        <Typography>
          After updating the request template as necessary, click Submit to log
          out.
        </Typography>
      </DialogContent>
    </Dialog>
  )
}
