import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material'
import styles from './InstructionsDialog.module.css'

export default function SPLogoutInstructionsDialog({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg">
      <DialogTitle>How to set up SP Logout</DialogTitle>
      <DialogContent>
        <Typography variant="h6">Video walkthrough:</Typography>
        <Typography>
          This video uses Auth0 as the Identity Provider. The setup would be
          roughly similar for other IdPs.
        </Typography>
        <Typography>
          <a
            href="https://www.youtube.com/watch?v=ZqvFG-CcIrA"
            target="_blank"
            rel="noreferrer"
          >
            https://www.youtube.com/watch?v=ZqvFG-CcIrA
          </a>
        </Typography>
        <div className={styles.spacer}></div>
        <Typography variant="h6" gutterBottom>
          IdP Configuration
        </Typography>
        <Typography>
          Before performing a logout, the IdP should be configured so it knows
          where to redirect back after logout.
        </Typography>
        <Typography>
          1. SAML Logout callback URL:{' '}
          <span className={styles.code}>https://samlmock.dev/callback</span>
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
        <Typography variant="h6" gutterBottom>
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
