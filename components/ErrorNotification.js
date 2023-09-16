import { forwardRef, useImperativeHandle, useState } from 'react'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/lab/Alert'

const ErrorNotification = forwardRef((props, ref) => {
  const [isOpen, setIsOpen] = useState(false)
  const [msg, setMsg] = useState('')

  /*
   * Instead of parent passing props to this component,
   * the parent will call the notify message using the ref with the message to display.
   * This is done to avoid maintaining open state and close functions in parent.
   */
  useImperativeHandle(ref, () => ({
    notify(msg) {
      setMsg(msg)
      setIsOpen(true)
    },
  }))

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <Snackbar
      open={isOpen}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert
        elevation={6}
        variant="filled"
        severity="error"
        onClose={handleClose}
      >
        {msg}
      </Alert>
    </Snackbar>
  )
})

// To get rid of ESLint error
ErrorNotification.displayName = 'ErrorNotification'

export default ErrorNotification
