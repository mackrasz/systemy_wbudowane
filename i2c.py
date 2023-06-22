import posix
from fcntl import ioctl
import time

def combine_bytes(msb, lsb):
	return msb << 8 | lsb

I2C_ADDR = 0x5c
I2C_SLAVE = 0x0703
i2cbus = 1

fd = posix.open('/dev/i2c-%d' % i2cbus, posix.O_RDWR)
ioctl(fd, I2C_SLAVE, I2C_ADDR)

try:
	posix.write(fd, b'\0x00')
except:
	pass
time.sleep(0.001)

posix.write(fd, b'\x03\x00\x04')
time.sleep(0.0016) #Wait at least 1.5ms for result
data = bytearray(posix.read(fd, 8))

print(data)

temp = combine_bytes(data[4], data[5])/10.0
humi = combine_bytes(data[2], data[3])/10.0

print('Temperature: {0} deg, Humidity: {1}%'.format(temp, humi))