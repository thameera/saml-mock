import { useEffect, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { xml } from '@codemirror/lang-xml'
import styles from './XMLEditor.module.css'

export default function XMLEditor({ xmlStr, updateXmlStr, disabled }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // This component's code needs a browser context and useEffect will run only in a browser
    // https://github.com/vercel/next.js/discussions/17443#discussioncomment-87097
    setMounted(true)
  }, [])

  const handleChange = (value) => {
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
            readOnly: disabled,
          }}
          onChange={handleChange}
          extensions={[xml()]}
        />
      )}
    </>
  )
}
