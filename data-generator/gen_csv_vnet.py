import csv
import random
import uuid
from datetime import datetime
from dateutil.relativedelta import relativedelta
import string
import calendar

#total events for all files
SAMPLE = 10_000_000

#start and end dates for backfill
start = '2023-01-01'
end = '2023-06-30'

#create list to use for monthly files
def generate_yyyymm_list(start_date, end_date):
    start_date = datetime.strptime(start_date, "%Y-%m-%d")
    end_date = datetime.strptime(end_date, "%Y-%m-%d")
    yyyy_mm_list = []

    current_date = start_date
    while current_date <= end_date:
        yyyy_mm = current_date.strftime("%Y-%m")
        yyyy_mm_list.append(yyyy_mm)
        current_date += relativedelta(months=1)

    return yyyy_mm_list

#generate a random datetime, taking into account months with 28, 30, or 31 days
def generate_random_date(month_string):
    year, month = map(int, month_string.split('-'))
    _, num_days = calendar.monthrange(year, month)
    day = random.randint(1, num_days)
    hour = random.randint(0, 23)
    minute = random.randint(0, 59)
    second = random.randint(0, 59)
    microsecond = random.randint(0, 999999)
    
    date_time = datetime(year, month, day, hour, minute, second, microsecond)
    return date_time.strftime("%Y-%m-%d %H:%M:%S.%f")

#get vehicle hierarchy info from csv
csv_file_path = './data-generator/vehicle_hierarchy.csv'

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

#create and write to monthly files
def write_monthly_files():
    print(datetime.now())

    file_list = generate_yyyymm_list(start,end)
    events_per_file = round(SAMPLE/len(file_list))

    headers = ['companyid','modelnumber','serialnumber','stackid','correlationid','deviceid','eventrecorderid','groupid','rootgroupid','vehicleid','timezone','datatype','source','value','epoch']

    for _ in file_list:
        with open (f'./data-generator/backfill_data/{_}.csv','w') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(headers)

            for i in range(events_per_file):

                rand_vehicle = random.randint(0,len(vehicle_ids)-1)
                
                #random data types and values
                data_types = {
                     'SPEED_KPH': random.randint(0,100),
                     #'ENGINE_SPEED': random.randint(0,20),
                     'ODOMETER': (random.randint(1000,4000)),
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
                     #'TIRE_PRESSURE': random.randint(25,33),
                     #'TIRE_LOCATION': random.randint(1,4),
                     #'SEAT_BELT_SWITCH': random.randint(0,1),
                     #'RIGHT_TURN': random.randint(0,1),
                     #'LEFT_TURN': random.randint(0,1),
                     #'PARKING_BRAKE_SWITCH': random.randint(0,1),
                     #'CRUISE_CONTROL_ACTIVE': random.randint(0,1)
                     }
                
                keys = list(data_types.keys())
                
                companyid = str(company_ids[rand_vehicle])
                modelnumber = model_numbers[rand_vehicle]
                serialnumber = serial_numbers[rand_vehicle]
                stackid = str(random.randint(1,100))
                correlationid = str(uuid.uuid4())
                deviceid = device_ids[rand_vehicle]
                eventrecorderid = str(uuid.uuid4())
                groupid = str(uuid.uuid4())
                rootgroupid = str(uuid.uuid4())
                vehicleid = vehicle_ids[rand_vehicle]
                timezone = 'UTC'
                datatype = random.choice(keys)
                source = source_types[rand_vehicle]
                value = data_types[datatype]
                epoch = generate_random_date(_)

                writer.writerow([companyid,modelnumber,serialnumber,stackid,correlationid,deviceid,eventrecorderid,groupid,rootgroupid,vehicleid,timezone,datatype,source,value,epoch])

        print(datetime.now())
        print(_+'.csv')
        #return(_+'.csv')

if __name__ == '__main__':
    write_monthly_files()