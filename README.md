[![Build Status](https://travis-ci.org/razorphish/core-api.svg?branch=master)](https://travis-ci.org/razorphish/core-api)

[![Coverage Status](https://coveralls.io/repos/github/razorphish/core-api/badge.svg)](https://coveralls.io/github/razorphish/core-api)

Passport Api
=========

A small library that manages passport authorization and authentication

## Installation

  `npm install @marasco/core-api`

## Usage

    var numFormatter = require('@marasco/core-api');

    var formattedNum = numFormatter(35666);
  
  
  Output should be `35,666`


## Tests

  `npm test`

## Contributing

In lieu of a formal style guide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality.  Lint and test your code.

## Articles

https://www.terlici.com/2014/09/15/node-testing.html

## Assets

update verion numbers

npm version patch|major|minor|premajor|preminor| -m "Version %s - add sweet badges"

git push && git push --tags

npm publish


https://stackoverflow.com/questions/40595895/how-can-i-generate-the-private-and-public-certificates-for-jwt-with-rs256-algori
You can generate them by installing and using the Cygwin package: http://www.cygwin.com.

Using the following commands:

1- Generating a Private Key:

openssl genrsa -aes256 -out private_key.pem 2048

2- Generating a Public Key:

openssl rsa -pubout -in private_key.pem -out public_key.pem


JWT TOken
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9           // header
.eyJrZXkiOiJ2YWwiLCJpYXQiOjE0MjI2MDU0NDV9      // payload
.eUiabuiKv-8PYk2AkGY4Fb5KMZeorYBLw261JPQD5lM   // signature

& 'C:\Program Files\OpenSSL-Win64\bin\openssl.exe' genrsa -out private.pem 1024
& 'C:\Program Files\OpenSSL-Win64\bin\openssl.exe' rsa -in private.pem -out public.pem -outform PEM -pubout

echo -n "RaC0nt@Ur1+2" | & 'C:\Program Files\OpenSSL-Win64\bin\openssl.exe' dgst -RSA-SHA256 -sign private.pem > signed

https://report-uri.com/home/pem_decoder

https://jwt.io

{
    "username": "bitchmode",
	"grant_type":"urn:ietf:params:oauth:grant-type:jwt-bearer",
	"assertion": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImRhdmlkQG1hcmFzLmNvIiwicGFzc3dvcmQiOiJMZXRtZTFuISJ9.wVlz5OmFioIKmAoFO0cZ_o9xIaNIHQXRjICRgfy9tSGRmWvN3h8nGfIX1n0-DSkUOzy5USryyrQ1TjX7LyOTY4FD6V35meatY3L9baPjk5wJh6FT-BsqCWxTFX4bXNNA7yIepGwIMwUIE5ob-8_vl0L3iSeRDDbabkvUtg4O2p0",
	"client_id": "core-web-ui",
	"client_secret": "E89fZK0oQnEuMWuqRhpNZG5ObexOw81RdnWHnSIuQVjaei3bag4kqnSyPXIrAi5gpYQcPU98leY1J5eL1sQUrUCRjS3SdZlMK1vSSv1kORtDqaxdYslVMe8uCBxk4NpPkwFkiWB8ywHnAjXBZpRdXHry8Aj19KS7XQUvi3DVW953MqCJgipQm76Lw8rNfAl1oQMyjPyBVcGKGecaevaz5bKulZWKx6m0sFKbNs2eT6FDiOfTuF25IHgKymnnoaCF"
}

iss: (issuer) claim identifies the principal that issued the JWT (String/URI value:Case-sensitive:Optional)

sub: (subject) claim identifies the principal that is the subject of the JWT. The claims in a JWT are normally statements about the subject.  The subject value MUST either be scoped to be locally unique in the context of the issuer or be globally unique (App Specific:case-sensitive:Optional)

aud: (audience) claim identifies the recipients that the JWT is
   intended for.Each principal intended to process the JWT MUST
   identify itself with a value in the audience claim.  If the principal processing the claim does not identify itself with a value in the "aud" claim when this claim is present, then the JWT MUST be rejected.  In the general case, the "aud" value is an array of case-sensitive strings, each containing a StringOrURI value.  In the special case when the JWT has one audience, the "aud" value MAY be a single case-sensitive string containing a StringOrURI value.  The interpretation of audience values is generally application specific. Use of this claim is OPTIONAL.
exp: This will probably be the registered claim most often used. This will define the expiration in NumericDate value. The expiration MUST be after the current date/time.

nbf: Defines the time before which the JWT MUST NOT be accepted for processing

iat: The time the JWT was issued. Can be used to determine the age of the JWT

jti: Unique identifier for the JWT. Can be used to prevent the JWT from being replayed. This is helpful for a one time use token.