"use strict";

const client = mqtt.connect("wss://broker.emqx.io:8084/mqtt");

const globalTopic = "/pexmor/qrpay/1234";

client.on("error", (error) => {
  console.error("Connection failed: ", error);
});

client.on("end", () => {
  console.log("Disconnected");
});

client.on("offline", () => {
  console.log("Client is offline");
});

client.on("reconnect", () => {
  console.log("Reconnecting...");
});

client.on("close", () => {
  console.log("Connection closed");
});

client.on("connect", () => {
  client.subscribe(globalTopic, (err) => {
    if (!err) {
      client.publish(globalTopic, "Hello mqtt");
    }
  });
});

client.on("message", (topic, message) => {
  try {
    let data = JSON.parse(message.toString());
    console.log(topic, data);
    // Do something with data
  } catch (error) {
    console.log(topic, message.toString());
    console.log("Error parsing message: ", error.message);
  }
  // client.end();
});
