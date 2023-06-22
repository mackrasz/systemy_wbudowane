var net = require('net');

var client = new net.Socket();

client.connect({ port: 65432, host: '192.168.43.76' }, ()=> {
    client.on('data', (data) => {
        console.log(data.toString());
        client.end();
    });
});
