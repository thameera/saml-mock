import { useEffect, useState } from 'react'
import { Controlled as CodeMirror } from 'react-codemirror2'
import styles from './XMLEditor.module.css'

export default function XMLEditor({ xmlStr, updateXmlStr, disabled }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // This component's code needs a browser context and useEffect will run only in a browser
    // https://github.com/vercel/next.js/discussions/17443#discussioncomment-87097
    require('codemirror/mode/xml/xml')
    setMounted(true)
  }, [])

  const handleChange = (editor, data, value) => {
    updateXmlStr && updateXmlStr(value)
  }

  return (
    <>
      {mounted && (
        <CodeMirror
          value={xmlStr}
          className={styles.cmDiv}
          options={{
            mode: disabled ? 'plain' : 'xml',
            theme: 'xq-light',
            readOnly: disabled,
          }}
          onBeforeChange={handleChange}
        />
      )}
    </>
  )
}
