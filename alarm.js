var net = require('net');
var server = net.createServer();
var serialport = require('serialport')

const port = new serialport.SerialPort({
    path: 'COM10',
    baudRate: 9600
});

const parser = new serialport.ReadlineParser()
port.pipe(parser)
parser.on('data', (x)=>{
    console.log('GSM: ');
    console.log(x);
})

var state = 'ALARM_OFF';

server.on('connection', handleConnection);

server.listen(1234, ()=>{
    console.log('Server listening on %j', server.address());
});

function handleConnection(conn){
    var remoteAddress = conn.remoteAddress + ':' + conn.remotePort;
    console.log('Client connected from %s', remoteAddress);

    conn.on('data', onConnData);

    function onConnData(d){
        console.log('Received data from %s: %s', remoteAddress, d.toString());
        
        var msg = d.toString().trim();

        if (msg=='AlarmOn!')
        {
            if (state == 'ALARM_OFF')
            {
                state = 'ALARM_ON';
                console.log('Alarm triggered');

                port.write('AT+CMGS="+48792064003"\r\n');
                port.write('ALARM');

                var EOF = new Uint8Array([26])
                port.write(EOF);

            }
        }
        else if (msg=='AlarmOff!')
        {
            if (state == 'ALARM_ON')
            {
                state = 'ALARM_OFF';
                console.log('Alarm disabled');
            }
        }

    }
}