const express = require("express");
const msal = require('@azure/msal-node');
const fetch = require('node-fetch')

const SERVER_PORT = process.env.PORT || 3000;

const config = {
  auth: {
    clientId: "<client-id>",
    clientSecret: "<client-secret>",
    authority: "https://login.microsoftonline.com/common"
  }
};

const authCodeUrlParameters = {
  scopes: [`api://${config.auth.clientId}/user_impersonation`],
  redirectUri: "http://localhost:3000/redirect",
};

// Create msal application object
const cca = new msal.ConfidentialClientApplication(config);

// Create Express App and Routes
const app = express();

app.get('/', async (req, res) => {
  try {
    const response = await cca.getAuthCodeUrl(authCodeUrlParameters);
    res.redirect(response);
  } catch(e) {
    console.log(JSON.stringify(e))
  }
});

app.get('/redirect', async (req, res) => {
  const tokenRequest = {
    code: req.query.code,
    ...authCodeUrlParameters
  };
  
  try {
    const response = await cca.acquireTokenByCode(tokenRequest);
    const accessToken = response.accessToken;

    const data = await fetch("http://localhost:7071/api/profile", {
      headers: {
        "authorization": `Bearer ${accessToken}`
      }
    });

    if (data && data.ok) {
      res.status(200).send(await data.json());
      return;
    }

    res.status(data.status).send({});
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
  

});

app.listen(SERVER_PORT, () => console.log(`App listening on: http://localhost:${SERVER_PORT}`))