export const canonicalize = (xmlStr) => {
  // https://github.com/auth0/node-samlp/blob/54d8715926c3066074412138714ad362f5a5f0da/lib/samlp.js#L26-L30
  return xmlStr
    .replace(/\r\n/g, '')
    .replace(/\n/g, '')
    .replace(/>(\s*)</g, '><') //unindent
    .trim()
}
