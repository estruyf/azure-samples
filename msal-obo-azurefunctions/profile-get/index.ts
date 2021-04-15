import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import jwt, { JwtHeader, SigningKeyCallback } from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { ConfidentialClientApplication, OnBehalfOfRequest } from "@azure/msal-node";
import fetch from "node-fetch";

// For simplicity the config has been added to the function
// When using this in production, make sure to move these keys to Azure Key Vault
const config = {
  auth: {
    clientId: "<client-id>",
    clientSecret: "<client-secret>",
    authority: "https://login.microsoftonline.com/common"
  }
};

/**
 * Retrieve the signing key
 * @param header 
 * @returns 
 */
const getSigningKeys = (header: JwtHeader, callback: SigningKeyCallback) => {
  const client = jwksClient({
    jwksUri: 'https://login.microsoftonline.com/common/discovery/keys'
  });
  
  client.getSigningKey(header.kid, function (err, key: any) {
    callback(null, key.publicKey || key.rsaPublicKey);
  });
}

/**
 * Validate the JWT Token
 * @param req 
 */
const validateToken = (req: HttpRequest): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ').pop();
      
      const validationOptions = {
        audience: `api://${config.auth.clientId}`
      }

      jwt.verify(token, getSigningKeys, validationOptions, (err, payload) => {
        if (err) {
          reject(403);
          return;
        }
        
        resolve(token);
      });
    } else {
      reject(401);
    }
  });
};


const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  try {
    const token = await validateToken(req);

    const oboRequest: OnBehalfOfRequest = {
      oboAssertion: token,
      scopes: ["user.read"],
    }

    try {
      const cca = new ConfidentialClientApplication(config);
      const response = await cca.acquireTokenOnBehalfOf(oboRequest);

      if (response && response.accessToken) {
        const graphResponse = await fetch(`https://graph.microsoft.com/v1.0/me`, {
          headers: {
            "authorization": `Bearer ${response.accessToken}`
          }
        });

        if (graphResponse && graphResponse.ok) {
          const data = await graphResponse.json();
          
          context.res = {
            body: data,
            headers: {
              "content-type": "application/json"
            }
          };
          return;
        } else {
          throw graphResponse.status;
        }
      } else {
        throw 403;
      }
    } catch (e) {
      context.log(`ERROR: ${e.message}`);
      throw 500;
    }
  } catch(e) {
    context.res.status(e);
  }
};

export default httpTrigger;