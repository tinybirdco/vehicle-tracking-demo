# Vehicle Tracking Demo

The use case is a fleet manager that wants to check the real-time status of their vehicles, in terms of the latest VIN, odometer reading, and GPS coordinates per vehicle.

## Data Project

```txt
├── datasources
│   ├── fixtures
│   ├── kafka_sample_gps.datasource
│   ├── kafka_sample_vnet.datasource
│   ├── sample_gps_mv.datasource
│   ├── sample_latest_gps_mv.datasource
│   ├── sample_latest_odo_mv.datasource
│   ├── sample_latest_vin_mv.datasource
│   ├── sample_vnet_events_mv.datasource
│   ├── sample_vnet_mv.datasource
│   └── vehicle_hierarchy.datasource
├── endpoints
│   ├── api_active_vehicles.pipe
│   ├── api_events_trend.pipe
│   ├── api_filter_company.pipe
│   ├── api_filter_serial.pipe
│   ├── api_latest_gps.pipe
│   ├── api_odo_gps_per_vehicle.pipe
│   ├── api_top_odom.pipe
│   ├── api_vin_odo_per_vehicle.pipe
│   └── api_vin_odo_per_vehicle_fulldownload.pipe
├── pipes
│   ├── sample_gps_materialization.pipe
│   ├── sample_latest_gps_materialization.pipe
│   ├── sample_latest_odo.pipe
│   ├── sample_latest_vin.pipe
│   ├── sample_vnet_events_mat.pipe
│   └── sample_vnet_materialization.pipe
```

In the `/data-project/datasources` folder, we have two Kafka data sources, one vehicle hierarchy (i.e. dimension table), and several materialized data sources.

In the `/data-project/pipes` folder, we have several materialized view pipes to extract JSON strings and calculate the latest values.

In the `/data-project/endpoints` folder, we have the API endpoints that are used in the front end.

Note: before tb pushing, you need to create the kafka connection with `tb connection create kafka --bootstrap-servers $BOOTSTRAP_SERVERS --key $SASL_PLAIN_USERNAME --secret $SASL_PLAIN_PASSWORD --connection-name tb_confluent`

Then, a `tb push --push-deps` will work.

## Data Generator

In the `/data-generator` folder, there are four Python scripts to generate dummy data:

1. `gen_vehicles.py` generates `vehicle_hierarchy.csv`, which is a CSV file containing a unique identifier for each vehicle and the associated dimensional data (company, serial number, etc.). This file must be generated first because it is referenced by the other scripts.

2. `gen_kafka_vnet.py` produces messages to the Kafka topic `demo_vehicle_vnet`, containing data about VIN, odometer readings, and other data types. This script references `vehicle_hierarchy.csv` to ensure repeatability and a common hierarchy. Each message contains a Kafka header. The script loops through several `data_types` for each vehicle to ensure repeatability (so the front end will show data changing for a specific vehicle).

3. `gen_kafka_gps.py` produces messages to the Kafka topic `demo_vehicle_gps`, containing data about GPS location. This script references `vehicle_hierarchy.csv` to ensure repeatability and a common hierarchy. Each message contains a Kafka header.

4. `gen_csv_vnet.py` is optional - it is used to generate monthly CSV files to backfill data (in case history is important).

To use the kafka scripts, create a `.env` file in the `/data-generator` folder with the following content:

```.env
BOOTSTRAP_SERVERS=<YOUR_SERVER>
SASL_PLAIN_USERNAME=<YOUR_USERNAME>
SASL_PLAIN_PASSWORD=<YOUR_PASSWORD>
```

Note: do not forget to add the generated vehicle_hierarchy.csv file into the vehicle_hierarchy Data Source.

```bash
cd ../data-project
tb datasource append vehicle_hierarchy ../data-generator/vehicle_hierarchy.csv
```

## Dashboard

The dashboard was built using [Tremor](https://www.tremor.so/).

There are two tabs to visualize data from the two Kafka topics. There are dropdowns to filter on a specific company or serial number. There is also a dropdown used to refresh the dashboard on-demand (default), or every five seconds. The latter option is useful when demonstrating real-time updates to a single vehicle (you can filter on a specific serial number and see the values update every five seconds).

There is also a text input field to enter a token. By default, the dashboard uses a token that has access to all data. There is another token named `demo dashboard token company` that has a filter on a single company, which you can use in the dashboard to show row-level security.
