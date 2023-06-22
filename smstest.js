var serialport = require('serialport')

const port = new serialport.SerialPort({
    path: 'COM10',
    baudRate: 9600
});

const parser = new serialport.ReadlineParser()
port.pipe(parser)
parser.on('data', console.log)

//port.write('ATI\r\n')
port.write('AT+CMGS="+48792064003"\r\n');
port.write('ALARM');

var EOF = new Uint8Array([26])
port.write(EOF);