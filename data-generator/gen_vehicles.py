import csv
import random
import uuid
import datetime
import string

sample = 100_000

vehicle_ids = [str(uuid.uuid4()) for _ in range(sample)]
company_ids = list(range(10000, 10021))
weights = [_ / 10 for _ in range(1, len(company_ids) + 1)]
serial_numbers = [''.join(random.choices(string.ascii_uppercase + string.digits, k=10)) for _ in range(sample)]
model_numbers = ['ER-SF300V2','ER-SF300','ER-SF400']
source_types = ['OBD2','J1939']
device_ids = [str(uuid.uuid4()) for _ in range(sample)]


def generate_vehicles():

    print(datetime.datetime.now())

    file_name = 'vehicle_hierarchy.csv'
    headers = ['vehicleid','companyid','serialnumber','modelnumber','sourcetype','deviceid']

    with open (f'./{file_name}','w') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(headers)

        for _ in range(sample):
            vehicleid = vehicle_ids[_]
            companyid = random.choices(company_ids, weights=weights)[0]
            serialnumber = serial_numbers[_]
            modelnumber = random.choice(model_numbers)
            sourcetype = random.choice(source_types)
            deviceid = device_ids[_]

            writer.writerow([vehicleid, companyid, serialnumber, modelnumber, sourcetype, deviceid])
    
    print(datetime.datetime.now())
    print(file_name)
    return(file_name)

if __name__ == '__main__':
    generate_vehicles()