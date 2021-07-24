import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { WebPubSubServiceClient } from "@azure/web-pubsub";
import jwt from "jsonwebtoken";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  try {
    const connection = process.env.AZURE_PUBSUB_CONNECTION_STRING;

    const authHeaderMatch = /^Bearer (.*)/i.exec(req.headers["authorization"]);
    // Decode token and get signing key
    const encodedToken = authHeaderMatch[1];
    const decodedToken = jwt.decode(encodedToken, { complete: true });
    const userId = decodedToken.oid || null;
    
    const serviceClient = new WebPubSubServiceClient(connection, 'hub');
    
    const authUrl = await serviceClient.getAuthenticationToken({
        userId
    });

    if (authUrl && authUrl.url) {
        context.res.status(200).json({ url: authUrl.url});
    } else {
        context.res.status(403).json(null);
    }
  } catch(e) {
    context.res.status(e);
  }
};

export default httpTrigger;