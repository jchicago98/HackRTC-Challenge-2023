const WebSocket = require("websocket").w3cwebsocket;

const uri = "wss://hackrtc.indigital.dev/text-control-api/v3";
const username = "hackrtc-34";
const password = "smH5Mnv1";
const agencyId = "hackrtc-34";
const agencySecret = "smH5Mnv1";

const basicAuth =
  "Basic " + Buffer.from(username + ":" + password).toString("base64");
const websocket = new WebSocket(uri, null, null, { Authorization: basicAuth });

var registerToken = "";

// Function to send a request and wait for a response
async function sendRequestAndWait(request) {
  return new Promise((resolve, reject) => {
    // Listen for messages from the server
    websocket.addEventListener("message", (event) => {
      const response = JSON.parse(event.data);
      resolve(response); // Resolve the promise when a response is received
    });

    // Send the request
    websocket.send(JSON.stringify(request));

    // Handle errors
    websocket.addEventListener("error", (event) => {
      console.log(event);
      reject(event.error);
    });
  });
}

async function getAgencyInfo() {
  const request = {
    action: "requestAgencyInfo",
    correlationId: "c455bd8e-c04e-4f53-89e6-41352da5fb2d",
    agencyIdentifier: agencyId,
    secret: agencySecret,
  };
  const response = await sendRequestAndWait(request);
  if (response.agency !== undefined) {
    registerToken = response.agency.registerToken;
  }
  return response;
}

async function getCallQueue() {
  const request = {
    action: "requestCallQueue",
    correlationId: "c455bd8e-c04e-4f53-89e6-41352da5fb2d",
    registerToken: registerToken,
  };
  return await sendRequestAndWait(request);
}

async function subCall() {
  const request = {
    action: "subscribe",
    correlationId: "c455bd8e-c04e-4f53-89e6-41352da5fb2d",
    registerToken: registerToken,
  };

  // Send the request
  websocket.send(JSON.stringify(request));

  // Listen for messages from the server
  websocket.addEventListener("message", (event) => {
    const response = JSON.parse(event.data);
    console.log(response)
  });

  // Handle errors
  websocket.addEventListener("error", (event) => {
    console.log(event);
    reject(event.error);
  });
}

websocket.onopen = async () => {
  console.log("WebSocket connection is open");

  const response1 = await getAgencyInfo();
  console.log("Response 1:", response1);

  subCall();
  const response2 = await getCallQueue();
  console.log("Response 2:", response2);
};

websocket.onclose = () => {
  console.log("WebSocket connection is closed");
};
