var express = require('express');
var net = require('net');
var app = express();

var parameters = {
   'temp': 15,
   'humid': 30
}

var alarmOn = false

app.use(express.static('public'))

app.post('/api/test/parameters', function (req, res){
   
   parameters.temp = Number(req.query.temp);
   parameters.humid = Number(req.query.humid);
   res.send("OK");
})

app.get('/api/parameters', function (req, res){

   setTimeout(()=>
   {
      var parameters = getParameters();

      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(parameters));
   }, 1000);
})


app.get('/api/alarmoff', function(req, res){
   disableAlarm();
   res.send('Alarm disabled!');
})

app.get('/api/alarmstate', function(req, res){
   var alarmState = getAlarmState();
   res.send(alarmState);
})

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
})

function getParameters(callback)
{
   if (callback !== undefined)
   {
      callback(parameters);
   }

   
   return parameters;
}

function getCurrentAlarmValues()
{
   return {'temp': 27, 'humid': 40};
}

function triggerAlarm()
{
   if (alarm == false)
   {
      alarm = true;
      console.log('Alarm!');
      var client = new net.Socket();
      client.connect({ port: 1234, host: 'localhost' }, ()=> {
         client.write('AlarmOn!');
         client.end();
      });
   }
}

function disableAlarm()
{
   alarm = false;
   console.log('Alarm disabled!');
   var client = new net.Socket();
   client.connect({ port: 1234, host: 'localhost' }, ()=> {
      client.write('AlarmOff!');
      client.end();
  });
}

function getParametersPeriodically()
{
   getParameters((x)=>{
      //console.log(x);

      var alarmValues = getCurrentAlarmValues();

      if (x.temp > alarmValues.temp || x.humid > alarmValues.humid)
      {
         triggerAlarm();
      }

      setTimeout(getParametersPeriodically, 1000);
   });
}

var alarm = false;

function getAlarmState()
{
   if (alarm == true)
   {
      return "on";
   }
   else
   {
      return "off";
   }
}

function getParametersFromServer()
{
   var client = new net.Socket();
   client.connect({ port: 65432, host: '192.168.43.76' }, ()=> {
      client.on('close',()=>{
         setTimeout(getParametersFromServer, 1000);
      });

      client.on('data', (data) => {
         var data_json = data.toString();
         parameters = JSON.parse(data_json);
         console.log(parameters);

         var alarmValues = getCurrentAlarmValues();

         if (parameters.temp > alarmValues.temp || parameters.humid > alarmValues.humid)
         {
            triggerAlarm();
         }
         client.end();
      });
   });
}

getParametersFromServer();

//getParametersPeriodically();