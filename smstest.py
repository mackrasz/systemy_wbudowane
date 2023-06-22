import serial

port = 'COM10'
baudrate = 9600

serialPort = serial.Serial(port=port, baudrate=baudrate, bytesize=8, 
                           timeout=2, stopbits=serial.STOPBITS_ONE)
print("Connected to serial port")

def send(buffer):
    print(buffer)
    serialPort.write(buffer)

def read():
    lines = serialPort.readlines()
    lines_decoded = [x.decode('ASCII') for x in lines]
    return lines_decoded

def printlines(lines):
    for l in lines:
        print(l, end='')

send(b'ATI\r\n')
l = read()
printlines(l)

send(b'AT+CMGS="+48792064003"\r\n')
read()
send(b'Test')
send(bytes([26]))
l = read()
printlines(l)