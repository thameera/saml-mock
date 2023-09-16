import CodeMirror from '@uiw/react-codemirror'
import { xml } from '@codemirror/lang-xml'
import { createTheme } from '@uiw/codemirror-themes'
import { tags as t } from '@lezer/highlight'
import styles from './XMLEditor.module.css'

const xmlTheme = createTheme({
  theme: 'light',
  settings: {
    background: '#ffffff',
    foreground: '#000000', // Regular text
    caret: '#5d00ff',
    selection: '#036dd626',
    selectionMatch: '#036dd626',
    lineHighlight: '#8a91991a',
    gutterBackground: '#fff',
    gutterForeground: '#8a919966',
  },
  styles: [
    { tag: [t.meta, t.comment], color: '#804000' },
    { tag: [t.keyword, t.strong], color: '#0000FF' },
    { tag: [t.number], color: '#FF0080' },
    { tag: [t.string], color: '#FF0000' }, // String in quotes
    { tag: [t.attributeName], color: '#75167D' }, // Attribute name
    { tag: [t.variableName], color: '#006600' },
    { tag: [t.escape], color: '#33CC33' },
    { tag: [t.tagName, t.angleBracket], color: '#507E7F' }, // Tag name, angle bracket
    { tag: [t.heading], color: '#0C07FF' },
    { tag: [t.quote], color: '#000000' },
    { tag: [t.list], color: '#B90690' },
    { tag: [t.documentMeta], color: '#888888' },
    { tag: [t.function(t.variableName)], color: '#0000A2' },
    { tag: [t.definition(t.typeName), t.typeName], color: '#6D79DE' },
  ],
})

export default function XMLEditor({ xmlStr, updateXmlStr, disabled }) {
  const handleChange = (value) => {
    updateXmlStr && updateXmlStr(value)
  }

  return (
    <>
      <CodeMirror
        value={xmlStr}
        className={styles.cmDiv}
        options={{
          mode: disabled ? 'plain' : 'xml',
          readOnly: disabled,
        }}
        onChange={handleChange}
        extensions={[xml()]}
        theme={xmlTheme}
      />
    </>
  )
}
