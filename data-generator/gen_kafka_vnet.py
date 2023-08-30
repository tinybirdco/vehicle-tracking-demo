import click
import time
import json
import csv
import random
import faker
import uuid
import string

from datetime import datetime
from confluent_kafka import Producer
import socket

import os
from dotenv import load_dotenv

fake = faker.Faker()


@click.command()
@click.option('--topic', help ='the kafka topic. demo_vehicle_vnet by default', default='demo_vehicle_vnet')
@click.option('--sample', type=int, default=10_000) #this is the number of events per vehicleid. if there are 7 data types, the script will generate 7*10,000 events
@click.option('--sleep', type=float, default=1)
@click.option('--mps', help='number of messages per sleep (by default 200, and as by default sleep is 1, 200 messages/s',type=int, default=200)
@click.option('--repeat', type=int, default=1)
@click.option('--bootstrap-servers', default='')
@click.option('--security_protocol', default='SASL_SSL')
@click.option('--sasl_mechanism', default='PLAIN')
@click.option('--sasl_plain_username', default='')
@click.option('--sasl_plain_password', default='')
@click.option('--utc', help='UTC datetime for tmstmp by default', type=bool, default=True)
@click.option('--bcp', is_flag=True, default=False)
def produce(topic,
            sample,
            sleep,
            mps,
            repeat,
            bootstrap_servers,
            security_protocol,
            sasl_mechanism,
            sasl_plain_username,
            sasl_plain_password,
            utc,
            bcp):
  
  # Load the environment variables from the .env file
  load_dotenv()
  bootstrap_servers = os.getenv('BOOTSTRAP_SERVERS') if len(bootstrap_servers)==0 else bootstrap_servers
  sasl_plain_username = os.getenv('SASL_PLAIN_USERNAME') if len(sasl_plain_username)==0 else sasl_plain_username
  sasl_plain_password = os.getenv('SASL_PLAIN_PASSWORD') if len(sasl_plain_password)==0 else sasl_plain_password

  conf = {
    'bootstrap.servers': bootstrap_servers,
    'client.id': socket.gethostname(),
    'security.protocol': security_protocol,
    'sasl.mechanism': sasl_mechanism,
    'sasl.username': sasl_plain_username,
    'sasl.password': sasl_plain_password,
    'compression.type': 'lz4'
    }

  producer = Producer(conf)

  onqueue = -1
  t = time.time()

  #get vehicle hierarchy info from csv
  csv_file_path = './vehicle_hierarchy.csv'

  vehicle_ids = []
  company_ids = []
  serial_numbers = []
  model_numbers = []
  source_types = []
  device_ids = []

  with open(csv_file_path, 'r') as file:
      csv_reader = csv.reader(file)
      next(csv_reader)
      for row in csv_reader:
          vehicle_ids.append(row[0])
          company_ids.append(row[1])
          serial_numbers.append(row[2])
          model_numbers.append(row[3])
          source_types.append(row[4])
          device_ids.append(row[5])
  
  for _ in range(repeat):

    for i in range(sample):

      data_types = {
        'SPEED_KPH': random.randint(0,100),
        'ENGINE_SPEED': random.randint(0,20),
        'ODOMETER': ((i + _) * random.uniform(0.1,2)),
        #'ENGINE_HOURS': random.randint(1,10),
        #'MIL': random.randint(0,1),
        #'DTC': random.randint(0,1),
        #'ABS_ACTIVE': random.randint(0,1),
        #'ENGINE_THROTTLE_POSITION': random.randint(0,1),
        #'ENGINE_FUEL_RATE': random.randint(10,100),
        #'BRAKE_SWITCH': random.randint(0,1),
        'VIN1': ''.join(random.choices(string.ascii_uppercase + string.digits, k=8)),
        'VIN2': ''.join(random.choices(string.ascii_uppercase + string.digits, k=8)),
        'VIN3': random.randint(1,10),
        'TIRE_PRESSURE': random.randint(25,33),
        #'TIRE_LOCATION': random.randint(1,4),
        #'SEAT_BELT_SWITCH': random.randint(0,1),
        #'RIGHT_TURN': random.randint(0,1),
        #'LEFT_TURN': random.randint(0,1),
        #'PARKING_BRAKE_SWITCH': random.randint(0,1),
        #'CRUISE_CONTROL_ACTIVE': random.randint(0,1)  
      }
      
      header = {
          "companyid": company_ids[i % len(company_ids)],
          "modelnumber": model_numbers[i % len(model_numbers)],
          "serialnumber": serial_numbers[i % len(serial_numbers)],
          "stackid": str(random.randint(1,100)),
          "correlationid": str(uuid.uuid4()),
          "deviceid": device_ids[i % len(device_ids)],
          "eventrecorderid": str(uuid.uuid4()),
          "groupid": str(uuid.uuid4()),
          "rootgroupid": str(uuid.uuid4()),
          "vehicleid": vehicle_ids[i % len(vehicle_ids)],
          "timezone": "UTC"
        }

      for k in list(data_types.keys()):
    
        message = {
          "seqNum": -1,
          "tsSec": int(time.time()),
          "tsUsec": int(time.time() % 1 * 1000000),
          "samples": [
            json.dumps({"tsSec": int(time.time()),
              "tsUsec": int(time.time() % 1 * 1000000),
              "datatype": k,
              "source": source_types[i % len(source_types)],
              "value": data_types[k]
            })
          ]
        }

        msg=json.dumps(message).encode('utf-8')

        # print(message)   
        producer.produce(topic, value=msg, headers=header)

      onqueue += len(data_types)
      while onqueue >= mps:
        before_onqueue = onqueue
        time.sleep(sleep)
        onqueue = producer.flush(2)
        sent = before_onqueue - onqueue
        dt = time.time() - t
        print(f"Sent {int(sent/dt)} messsages/second. {i*len(data_types)} of {sample*len(data_types)}")
        t = time.time()

    if sleep:
      producer.flush()
      time.sleep(sleep)
      print(f'{sample*len(data_types)} sent! {_+1} of {repeat} - {datetime.now()}')
    producer.flush()

if __name__ == '__main__':
    produce()
