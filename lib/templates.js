export const responseTemplate = `<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" ID="{id}" InResponseTo="{inResponseTo}" Version="2.0" IssueInstant="{issueTime}" Destination="{destination}">
	<saml:Issuer xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">{issuer}</saml:Issuer>
	<samlp:Status>
		<samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/>
	</samlp:Status>
	{assertion}
</samlp:Response>`

export const assertionTemplate = `<saml:Assertion xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" Version="2.0" ID="1234" IssueInstant="{issueTime}">
	<saml:Issuer>{issuer}</saml:Issuer>
	<saml:Subject>
		<saml:NameID Format="urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified">john.doe@example.com</saml:NameID>
		<saml:SubjectConfirmation Method="urn:oasis:names:tc:SAML:2.0:cm:bearer">
			<saml:SubjectConfirmationData NotOnOrAfter="{expiryTime}" Recipient="{acsUrl}" InResponseTo="{inResponseTo}"/>
		</saml:SubjectConfirmation>
	</saml:Subject>
	<saml:Conditions NotBefore="{issueTime}" NotOnOrAfter="{expiryTime}">
		<saml:AudienceRestriction>
			<saml:Audience>{audience}</saml:Audience>
		</saml:AudienceRestriction>
	</saml:Conditions>
	<saml:AuthnStatement AuthnInstant="{issueTime}" SessionIndex="2345">
		<saml:AuthnContext>
			<saml:AuthnContextClassRef>urn:oasis:names:tc:SAML:2.0:ac:classes:unspecified</saml:AuthnContextClassRef>
		</saml:AuthnContext>
	</saml:AuthnStatement>
	<saml:AttributeStatement xmlns:xs="http://www.w3.org/2001/XMLSchema"
		xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
		<saml:Attribute Name="http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:uri">
			<saml:AttributeValue xsi:type="xs:string">john.doe@example.com</saml:AttributeValue>
		</saml:Attribute>
		<saml:Attribute Name="http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:uri">
			<saml:AttributeValue xsi:type="xs:string">john.doe@example.com</saml:AttributeValue>
		</saml:Attribute>
		<saml:Attribute Name="http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:uri">
			<saml:AttributeValue xsi:type="xs:string">John Doe</saml:AttributeValue>
		</saml:Attribute>
		<saml:Attribute Name="http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:uri">
			<saml:AttributeValue xsi:type="xs:string">John</saml:AttributeValue>
		</saml:Attribute>
	</saml:AttributeStatement>
</saml:Assertion>`

export const requestTemplate = `<samlp:AuthnRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" Destination="{signinUrl}" ID="{id}" IssueInstant="{issueTime}" ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Version="2.0">
	<saml:Issuer xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">{issuer}</saml:Issuer>
</samlp:AuthnRequest>`
