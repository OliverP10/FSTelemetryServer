from socketio import Client
from threading import Lock
import logging
import json
import time
from typing import List
import random

class Communicaition:
    logger = logging.getLogger(__name__)
    sio:Client = Client()
    lock:Lock = Lock()
    telemetry_buffer:any = []
    log_buffer:any = []
    connected: bool = False                     # Built in one doesnt work
    reconection:bool = False
    
    

    def __init__(self) -> None:
        self.call_backs()
        try:
            self.sio.connect('http://'+"localhost"+':3000')
        except Exception as e:
            self.logger.critical("Unable to connect to server: ",exc_info=e)

    def call_backs(self) -> None:

        @self.sio.event
        def connect() -> None:
            self.connected=True
            self.logger.info("Connected")
            self.sio.emit("setType", "vehicle")
            self.demo_telem()

    def demo_telem(self):
        while True:
            self.sio.emit('live-telemetry','{'+'"i":1,"d":'+str(random.randint(0,99))+'}')
            time.sleep(1)

comms = Communicaition()
            