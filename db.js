
const Influx = require('influx');

var mqtt = require("mqtt");
var mqtt_client = mqtt.connect("mqtt://localhost");

mqtt_client.on("connect", function () {
    mqtt_client.subscribe('data_logs', function (err) {
        if (!err) {
            mqtt_client.publish('presence', 'Hello mqtt')
        }
    })
    mqtt_client.subscribe('presence', function (err) {
        if (!err) {
            ///mqtt_client.publish('presence', 'Hello mqtt')
        }
    })

  });


mqtt_client.on("message", function (topic, message) {
    // message is Buffer
    console.log(topic)
    if(topic=="data_logs"){
      console.log("someone is writing to data logs")
    }
    //message = FormatData(message.toString());

    console.log("Data from Broker");
    console.log(topic);
    console.log(message);
  
    // mqtt_client.end()
})
  
const datafromdevice = {
    tags:[],
    data:{
        v1:320,i1:2
    },
    id:1,
    ts:1255574545
}

const influx = new Influx.InfluxDB({
    host: 'localhost',
    database: 'mida',
    port:8086,
    });

influx.getDatabaseNames()
.then(names=>{ 
    console.log(names)
    if(!names.includes('mida')){
        return influx.createDatabase('mida');
    }
});

function writeData(data){
    influx.writePoints(data).catch(error => {
        console.error(`Error saving data to InfluxDB!}`)
      }).then(() => {   
        console.log('Added data to the Db');
              
        });
}

influx.query(
    'select * from mida'
).catch(err=>{
    console.log(err);
}).then(results=>{
    console.log(results);
})

//Mqtt section




module.exports.writeData = writeData;
//okay