# Azure Function sample with OAuth On-Behalf-Of flow and MSAL

This is a sample of how you can make use of the OAuth On-Behalf-Of flow inside an Azure Function to perform certains actions on behalf of the user.

More information on how you can use this sample can be found here: [How to use the OAuth On-Behalf-Of flow in a Node.js Azure Functions](https://www.eliostruyf.com/oauth-behalf-flow-node-js-azure-functions/).

## Usage

- Clone this project
- Update the `client id` and `client secret` in the config object from the [index.ts](./profile-get/index.ts) file.
- Run: `npm i`
- Run: `npm start` to spin up the Azure Functions locally

If you want to test it out, you can make use of the sample test app in the `app` folder. To use it, perform the following steps:

- Update the `client id` and `client secret` in the config object from the [index.js](./app/index.js) file (should be the same as in your Azure Function).
- Run: `npm i`
- Run: `npm start`
- Open your browser, and navigate to `http://localhost:3000`