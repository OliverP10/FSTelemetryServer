from socketio import Client
from threading import Lock
import logging
import json
import time
from typing import List
import random


class Communicaition:
    logger = logging.getLogger(__name__)
    sio: Client = Client()
    lock: Lock = Lock()
    telemetry_buffer: any = []
    log_buffer: any = []
    connected: bool = False                     # Built in one doesnt work
    reconection: bool = False

    def __init__(self) -> None:
        self.call_backs()
        try:
            self.sio.connect('http://'+"localhost"+':3000')
        except Exception as e:
            self.logger.critical("Unable to connect to server: ", exc_info=e)

    def call_backs(self) -> None:

        @self.sio.event
        def connect() -> None:
            self.connected = True
            self.logger.info("Connected")
            self.sio.emit("setType", "vehicle")
            self.demo_telem()

    def demo_telem(self):
        run = False
        while True:
            if (run):
                data = {

                    # "13": random.randint(-19, 19),
                    # "14": random.randint(-19, 19),
                    # "15": random.randint(-19, 19),
                    # "16": random.randint(-19, 19),
                    # "17": random.randint(-19, 19),
                    # "18": random.randint(-19, 19),
                    # "19": random.randint(-19, 19),
                    # "20": random.randint(-19, 19),
                    # "21": random.randint(-19, 19),
                    # "22": random.randint(-19, 19),
                    # "23": random.randint(-19, 19),
                    # "24": random.randint(-19, 19),
                    # "25": random.randint(-19, 19),
                    # "26": random.randint(-19, 19),
                    # "27": random.randint(-19, 19),
                    # "28": random.randint(-19, 19),
                    # "29": random.randint(-19, 19),
                    # "30": random.randint(-19, 19),
                    # "31": random.randint(-19, 19),
                }
                # self.sio.emit("telemetry", json.dumps(data))
            run = False if run else True
            data = {
                "2": random.randint(-19, 19),
                "3": random.randint(-21, 21),
                "4": random.randint(-19, 19),
                # "4": random.randint(-19, 19),
                # "5": random.randint(-19, 19),
                # "6": random.randint(-19, 19),
                # "7": random.randint(-19, 19),
                # "8": random.randint(-19, 19),
                # "9": random.randint(-19, 19), dont use
                # "10": random.randint(-19, 19),
                # "11": random.randint(-19, 19),
                # "12": random.randint(-19, 19),
            }
            self.sio.emit("telemetry", json.dumps(data))
            time.sleep(0.1)


comms = Communicaition()
