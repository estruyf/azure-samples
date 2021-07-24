# Azure Function sample for generating an Azure Web PubSub token

This is a sample which you can use to generate a Azure Web PubSub token URL. This can be used for opening a WebSocket connection on the client-side.

More information on how you can use this sample can be found here: [#DevHack: Authentication for Azure Web PubSub with Azure Functions]().

## Usage

- Clone this project
- Create a `AZURE_PUBSUB_CONNECTION_STRING` environment variable with the connection string for your Azure Web PubSub endpoint.
- Run: `npm i`
- Run: `npm start` to spin up the Azure Functions locally