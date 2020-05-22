var express = require("express");
var app = express();
var http = require("http").Server(app);
var socketio = require("socket.io")(http);
const toJson = require("really-relaxed-json").toJson;

var mqtt = require("mqtt");
var mqtt_client = mqtt.connect("mqtt://localhost");

// const Influx = require('influxdb-nodejs');
// const client = new Influx('http://127.0.0.1:8086/mydb');
var influxAgent = require('./db');


mqtt_client.on("connect", function () {
  mqtt_client.subscribe('data_logs', function (err) {
      if (!err) {
          // mqtt_client.publish('presence', 'Hello mqtt')
      }
  })
  // mqtt_client.subscribe('presence', function (err) {
  //     if (!err) {
  //         // mqtt_client.publish('presence', 'Hello mqtt')
  //     }
  // })
});
// mqtt_client.on("message", function (topic, message) {

//   mqtt_client.on("connect", function () {


mqtt_client.on("message", function (topic, message) {
  // message is Buffer
  console.log(topic)
  if(topic=="data_logs"){
    console.log("someone is writing to data logs")

    console.log("Data from Broker");
    console.log(topic);
    console.log(message);
    message = FormatData(message.toString());
    console.log(message);
    //   console.log(typeof message);
    influxAgent.writeData([
      {
        measurement: 'data_logs',
        fields: { 
          cubicle_id: 1,
          kwh: Math.random()*500,
          v1: 3,
          v2:6,
          location: 'ppa'
        },
        tags: {
            datalogs:'datalog'
        }
      }
  
    ])
  }

  console.log("");
  try {
    socketio.emit("data_update", {
      source: "mqtt",
      topic: topic,
      payload: message,
    });
  } catch (e) {
    console.log(e);
  }

  // mqtt_client.end()
});

function FormatData(message) {
  try {
    let formatted_data = toJson(message);
    formatted_data = JSON.parse(formatted_data);
    return formatted_data;
  } catch (e) {
    // console.log(e);
  }

  return message;
}

























socketio.on("connection", function (clientsocket) {
  //console_log('A client connected: Remote address & Port = ' + clientsocket.request.connection.remoteAddress + ":" + clientsocket.request.connection.remotePort, true);
  //console.log('A client connected: Remote address & Port = ' + clientsocket.request.connection.remoteAddress + ":" + clientsocket.request.connection.remotePort);

  // clientsocket.emit('connected', {
  //     'msg': 'welcome',
  // });

  // console.log("connected")

  clientsocket.on("subscribe", async function (message, callback) {
    // console.log(message)
    try {
      if (message.source === "mqtt") {
        // console.log("Subscription");
        // console.log(message)
        mqtt_client.unsubscribe(message.topic);
        mqtt_client.subscribe(message.topic, function (err) {
          if (callback) {
            if (!err) {
              callback(true);
            } else {
              callback(false);
            }
          }
        });
      }
    } catch {
      if (callback) {
        callback(false);
      }
    }
  });

  clientsocket.on("cmd_msg", async function (msg, callback) {
    console.log(msg);
  });

  clientsocket.on("data_write", async function (message, callback) {
    console.log("Data Write from Client");
    console.log(message);
    console.log("");

    callback({
      message: "Thank you",
    });

    try {
      if (message.source === "mqtt") {
        // console.log("Data Write")
        // console.log(message)
        let payload = message.payload;
        if (typeof payload === "object") {
          try {
            payload = JSON.stringify(payload);
          } catch {}
        } else {
          payload = message.payload.toString();
        }

        // console.log(payload)
        try {
          mqtt_client.publish(message.topic, payload);
          //   mqtt_client.publish("measurement", payload);
        } catch (e) {
          console.log(e);
        }

        if (callback) {
          callback(true);
        }
        // console.log("Done")
      }
    } catch {
      if (callback) {
        callback(false);
      }
    }
  });
});

const port = 7778;

let led_state = false;

let count = 0;

function ProcessData() {
  // count++;
  // led_state = true
  // if (count > 5) {
  //     count = 0;
  //     led_state = false;
  // }
  led_state = !led_state;
  socketio.emit("data_update", {
    source: "mqtt",
    msg: new Date(),
    topic: "topic",
    payload: led_state,
    payload1: {
      state: led_state,
    },
  });

  // console.log("data")
  setTimeout(ProcessData, 1000);
}

try {
  http.listen(port, "0.0.0.0", function () {
    console.log("Listening on port " + port);
    console.log("-----------------------");

    ProcessData();
  });
} catch (err) {
  console.log(
    "\x1b[33m%s\x1b[0m",
    "!! Failed Listening on port " + port + " !!"
  );
  //console.log("\x1b[33m%s\x1b[0m", '!! Aborted... !!');
  console.log("");
  console.log("");
  //http.close();
  //console.log(err)
}
