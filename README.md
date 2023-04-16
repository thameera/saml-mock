# SAML Mock SP and IdP

Live version at: https://samlmock.dev

## Using the mock IdP

### SP Configuration

- Certificate: Can be downloaded from the top-left button at https://samlmock.dev/idp
- Sign-in URL: Set this to `https://samlmock.dev/idp?aud=SP_AUDIENCE&acs_url=SP_ACS_URL`. Replace `SP_AUDIENCE` and `SP_ACS_URL` correctly.

Example: https://samlmock.dev/idp?aud=urn:auth0:tham:mock-saml&acs_url=https://tham.auth0.com/login/callback

### Doing a SAML flow

1. Initiate a login from the SP.
2. When the Mock IdP screen appears, change any variables as necessary.
3. Click Submit button on top-right. The app will send a SAML response to the SP.

## Running locally

```bash
npm i
npm run dev
```

App will be available at [http://localhost:3333](http://localhost:3333).

## Inspirations and reference

- https://github.com/AmaanC/saml-idp
- https://github.com/auth0/node-saml
- https://github.com/auth0/node-samlp
- https://github.com/auth0/passport-wsfed-saml2
