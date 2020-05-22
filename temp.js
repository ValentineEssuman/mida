// const mqtt = require('mqtt');

// const client = mqtt.connect({ host: 'localhost', port: 1883 });

// client.on('connect', function() {
//   client.subscribe('presence', function(err) {
//     if (!err) {
//       client.publish('presence', 'Hello mqtt');
//     }
//   });
// });

// client.on('message', function(topic, message) {
//   // message is Buffer
//   console.log(message.toString());
//   client.end();
// });


// import * as io from 'socket.io-client';
const io = require('socket.io-client');

const client = io('http://localhost:1833');
client.on('connect', () => {
    console.log("Connected")
  client.emit('subscribe', { topic: 'OT' });
  client.emit('publish', { topic: 'OT', data: 'hello' });
});

client.on('mqtt', (event) => {
  // event.topic
  // event.message
  console.log(event);
});
