import pyqtgraph as pg
from PyQt5 import QtWidgets, QtCore
import numpy as np
import threading

import posix
from fcntl import ioctl
import time

import socket

HOST = "192.168.43.76"
PORT = 65432

def combine_bytes(msb, lsb):
	return msb << 8 | lsb

I2C_ADDR = 0x5c
I2C_SLAVE = 0x0703
i2cbus = 1

fd = posix.open('/dev/i2c-%d' % i2cbus, posix.O_RDWR)
ioctl(fd, I2C_SLAVE, I2C_ADDR)

buff_size = 1000

buff_t = np.zeros(buff_size)
buff_h = np.zeros(buff_size)

app = QtWidgets.QApplication([])

window = QtWidgets.QWidget()
window.setFixedSize(800, 600)
window.show()

layout = QtWidgets.QGridLayout(window)

plot_t = pg.PlotWidget()
plot_t.showGrid(True, True)
layout.addWidget(plot_t, 0, 0)
plot_tl = plot_t.plot(buff_t, pen='r', name='Temp')

plot_h = pg.PlotWidget()
plot_h.showGrid(True, True)
layout.addWidget(plot_h, 1, 0)
plot_hl = plot_h.plot(buff_h, pen='r', name='Humidity')

lock = threading.Lock()

@QtCore.pyqtSlot(object)
def update(x):
    lock.acquire()
    
    buff_t[0:-1] = buff_t[1:]
    buff_t[-1] = x[0]

    buff_h[0:-1] = buff_h[1:]
    buff_h[-1] = x[1]

    plot_tl.setData(buff_t)
    plot_hl.setData(buff_h)
    
    lock.release()

def kernel():
    while True:
        try:
            posix.write(fd, b'\0x00')
        except:
            pass
        time.sleep(0.001)

        posix.write(fd, b'\x03\x00\x04')
        time.sleep(0.0016) #Wait at least 1.5ms for result
        data = bytearray(posix.read(fd, 8))

        #print(data)

        temp = combine_bytes(data[4], data[5])/10.0
        humi = combine_bytes(data[2], data[3])/10.0

        #print('Temperature: {0} deg, Humidity: {1}%'.format(temp, humi))
        update([temp, humi])
        time.sleep(0.1)
        
def tcp_kernel():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind((HOST, PORT))
        s.listen()
        while True:
            print('Waiting for TCP connection')
            conn, addr = s.accept()
            with conn:
                print(f"Connected by {addr}")
                lock.acquire()
                data = bytes('{{\"temp\": {0}, \"humid\": {1}}}'.format(buff_t[-1], buff_h[-1]),'utf8')
                lock.release()
                conn.sendall(data)
            conn.close()

t = threading.Thread(target = kernel, daemon=True)
t.start()

tcp_t = threading.Thread(target = tcp_kernel, daemon = True)
tcp_t.start()

app.exec()
