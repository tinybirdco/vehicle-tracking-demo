"use client";

import { Card, Title, Text, Button, Grid, Col, AreaChart, BarList, Select, SelectItem, TabGroup, TabList, Tab, TabPanels, TabPanel, Table, TableHead, TableHeaderCell, TableBody, TableRow, TableCell, TextInput, Flex, Metric, Icon, Subtitle } from "@tremor/react";
import { useState } from "react";
import { ChevronDoubleUpIcon, GlobeAltIcon, TruckIcon, DownloadIcon } from "@heroicons/react/solid";
import useSWR from "swr";

const TINYBIRD_HOST = process.env.NEXT_PUBLIC_TINYBIRD_HOST;
const TINYBIRD_TOKEN = process.env.NEXT_PUBLIC_TINYBIRD_TOKEN;

const fetchTinybirdUrl = async (fetchUrl: string): Promise<any[]> => {
  console.log(fetchUrl);
  const data = await fetch(fetchUrl)
  const jsonData = await data.json();
  return jsonData.data;
};

export default function Dashboard() {
  const [page, setPage] = useState('1');  
  const [refreshFrequency, setRefreshFrequency] = useState("2");
  const [token, setToken] = useState(TINYBIRD_TOKEN);
  const [companyFilter, setCompanyFilter] = useState('All');
  const [serialFilter, setSerialFilter] = useState('All');
  
  let apiFilterCompany = `https://${TINYBIRD_HOST}/v0/pipes/api_filter_company.json?token=${token}&serial_param=${serialFilter}`;
  let apiFilterSerial = `https://${TINYBIRD_HOST}/v0/pipes/api_filter_serial.json?token=${token}&company_param=${companyFilter}`;
  let apiLatestGps = `https://${TINYBIRD_HOST}/v0/pipes/api_latest_gps.json?token=${token}&company_param=${companyFilter}&serial_param=${serialFilter}&page=${page}`;
  let apiLatestVin = `https://${TINYBIRD_HOST}/v0/pipes/api_vin_odo_per_vehicle.json?token=${token}&company_param=${companyFilter}&serial_param=${serialFilter}&page=${page}`;
  let apiActiveVs = `https://${TINYBIRD_HOST}/v0/pipes/api_active_vehicles.json?token=${token}&company_param=${companyFilter}&serial_param=${serialFilter}`;
  let apiEvents = `https://${TINYBIRD_HOST}/v0/pipes/api_events_trend.json?token=${token}&company_param=${companyFilter}&serial_param=${serialFilter}`;
  let apiTopOdom = `https://${TINYBIRD_HOST}/v0/pipes/api_top_odom.json?token=${token}&company_param=${companyFilter}&serial_param=${serialFilter}`;
  let apiDownload = `https://${TINYBIRD_HOST}/v0/pipes/api_vin_odo_per_vehicle_fulldownload.csv?token=${token}&company_param=${companyFilter}&serial_param=${serialFilter}`;

  const companyChoicesQuery = useSWR(
    [apiFilterCompany],
    () => fetchTinybirdUrl(apiFilterCompany),
    {
      refreshInterval: refreshFrequency === "1" ? 5000 : 0,
      fallbackData: [
        {
          companyid: "",
        },
      ],
    }
  );

  const serialChoicesQuery = useSWR(
    [apiFilterSerial],
    () => fetchTinybirdUrl(apiFilterSerial),
    {
      refreshInterval: refreshFrequency === "1" ? 5000 : 0,
      fallbackData: [
        {
          serialnumber: "",
        },
      ],
    }
  );

  const gpsTableQuery = useSWR(
    [apiLatestGps],
    () => fetchTinybirdUrl(apiLatestGps),
    {
      refreshInterval: refreshFrequency === "1" ? 5000 : 0,
      fallbackData: [
        {
          row: 0,
          timeInUTC: 0,
          latitude: "",
          longitude: "",
          speed: 0,
          heading: "",
          hdop: 0,
          numsats: 0,
          horizontalAccuracy: 0,
          serialnumber: "",
          modelnumber: "",
          companyid: "",
          //"groupid": '',
          //"eventrecorderid": '',
          vehicleid: "",
        },
      ],
    }
  );

  const vinTableQuery = useSWR(
    [apiLatestVin],
    () => fetchTinybirdUrl(apiLatestVin),
    {
      refreshInterval: refreshFrequency === "1" ? 5000 : 0,
      fallbackData: [
        {
          row: 0,
          timeInUTC: 0,
          companyid: "",
          serialnumber: "",
          vehicleid: "",
          modelnumber: "",
          source: "",
          VIN: "",
          odometer_mi: 0,
        },
      ],
    }
  );

  const vehiclesQuery = useSWR(
    [apiActiveVs],
    () => fetchTinybirdUrl(apiActiveVs),
    {
      refreshInterval: refreshFrequency === "1" ? 5000 : 0,
      fallbackData: [
        {
          n_vehicles: 0,
        },
      ],
    }
  );

  const eventsQuery = useSWR([apiEvents], () => fetchTinybirdUrl(apiEvents), {
    refreshInterval: refreshFrequency === "1" ? 5000 : 0,
    fallbackData: [],
  });

  const topOdomQuery = useSWR(
    [apiTopOdom],
    () => fetchTinybirdUrl(apiTopOdom),
    {
      refreshInterval: refreshFrequency === "1" ? 5000 : 0,
      fallbackData: [],
    }
  );

  const handleTokenChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setToken(event.target.value);
  };

  const handleCompanyFilterChange = (value: string) => {
    setCompanyFilter(value);
  };

  const handleSerialFilterChange = (value: string) => {
    setSerialFilter(value);
  };

  const numberFormatter = (number: number) => {
    return Intl.NumberFormat("us").format(number).toString();
  };

  const handleDownload = () => {
    const downloadLink = document.createElement('a');
    downloadLink.href = apiDownload;
    downloadLink.click();
  };
  
  return (
    <main className="p-6">
      <Grid numItems={4} className="flex justify-between space-x-4">
        <Flex flexDirection="col" alignItems="start">
          <Title>Fleet Manager</Title>
          <Text>Powered by <a href="https://www.tinybird.co/" target="_blank"><b>Tinybird</b></a></Text>
        </Flex>
        <div></div>
        <Flex flexDirection="col" alignItems="start" className="max-w-xs">
          <Text>Auth Token</Text>
          <TextInput
            type="password"
            defaultValue={token}
            onChange={handleTokenChange}
          />
        </Flex>
        <Flex flexDirection="col" alignItems="start" className="max-w-xs">
          <Text>Company</Text>
          <Select className="mt-1" value={companyFilter} onValueChange={handleCompanyFilterChange}>
            {companyChoicesQuery.data.map((item) => (
              <SelectItem key={item.companyid} value={item.companyid}/>
            ))}
          </Select>
        </Flex>
        <Flex flexDirection="col" alignItems="start" className="max-w-xs">
          <Text>Serial Number</Text>
          <Select className="mt-1" value={serialFilter} onValueChange={handleSerialFilterChange}>
            {serialChoicesQuery.data.map((item) => (
              <SelectItem key={item.serialnumber} value={item.serialnumber}/>
            ))}
          </Select>
        </Flex>
        <Flex flexDirection="col" alignItems="start" className="max-w-xs">
          <Text>Refresh Frequency</Text>
          <Select className="mt-1" defaultValue="2" onValueChange={setRefreshFrequency}>
            <SelectItem value="1">Every 5s</SelectItem>
            <SelectItem value="2">On demand</SelectItem>
          </Select>
        </Flex>
      </Grid>

      <TabGroup className="mt-4">
        <TabList>
          <Tab icon={ChevronDoubleUpIcon}>VNET</Tab>
          <Tab icon={GlobeAltIcon}>GPS</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Grid numItems={4} className="space-x-6 mt-6">
              <Col numColSpan={3}>
                {/* VNET table section */}
                <Card>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell>Datetime (UTC)</TableHeaderCell>
                        <TableHeaderCell>Company ID</TableHeaderCell>
                        <TableHeaderCell>Serial Number</TableHeaderCell>
                        <TableHeaderCell>Vehicle ID</TableHeaderCell>
                        <TableHeaderCell>Model Number</TableHeaderCell>
                        <TableHeaderCell>Source</TableHeaderCell>
                        <TableHeaderCell>VIN</TableHeaderCell>
                        <TableHeaderCell>Odometer (mi)</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {vinTableQuery.data.map((item) => (
                        <TableRow key={item.row}>
                          <TableCell>{item.timeInUTC}</TableCell>
                          <TableCell>{item.companyid}</TableCell>
                          <TableCell>{item.serialnumber}</TableCell>
                          <TableCell>{item.vehicleid}</TableCell>
                          <TableCell>{item.modelnumber}</TableCell>
                          <TableCell>{item.source}</TableCell>
                          <TableCell>{item.VIN}</TableCell>
                          <TableCell>{item.odometer_mi}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Flex className="mt-4" justifyContent="between">
                    <Flex className="space-x-2" justifyContent="center">
                      <Text>Page</Text>
                      <TextInput
                        className="w-4"
                        value={page}
                        onChange={ (event) => setPage(event.target.value) }
                      />
                    </Flex>
                    <Button icon={DownloadIcon} variant="secondary" onClick={handleDownload}>Download</Button>
                  </Flex>
                </Card>
              </Col>
              <Col numColSpan={1}>
                <Flex flexDirection="col" className="space-y-4">
                  <Card>
                    <Flex className="space-x-6">
                      <Icon icon={TruckIcon} size="xl" color="blue"/>
                      <Flex flexDirection="col" alignItems="start" className="space-y-1">
                        <Metric>{numberFormatter(vehiclesQuery.data[0].n_vehicles)}</Metric>
                        <Text>Vehicles active in the last hour</Text>
                      </Flex>
                    </Flex>
                  </Card>
                  <Card>
                    <Text>No. Events Trend</Text>
                    <AreaChart
                      data={eventsQuery.data}
                      index="ts"
                      categories={["n_events"]}
                      colors={["blue"]}
                      valueFormatter={numberFormatter}
                      showYAxis={false}
                      startEndOnly={true}
                      showLegend={false}
                      showGridLines={false}
                      className="h-44 mt-2"
                    />
                  </Card>
                  <Card>
                    <Text>Top 5 Vehicles by Odometer (mi)</Text>
                    <BarList
                      data={topOdomQuery.data}
                      valueFormatter={numberFormatter}
                      className="mt-2"
                    />
                  </Card>
                </Flex>
              </Col>
            </Grid>
          </TabPanel>
          
          <TabPanel>
            {/* GPS table section */}
            <Card className="mt-6">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Datetime (UTC)</TableHeaderCell>
                    <TableHeaderCell>Latitude</TableHeaderCell>
                    <TableHeaderCell>Longitude</TableHeaderCell>
                    <TableHeaderCell>Speed</TableHeaderCell>
                    <TableHeaderCell>Heading</TableHeaderCell>
                    <TableHeaderCell>HDOP</TableHeaderCell>
                    <TableHeaderCell>Numsats</TableHeaderCell>
                    <TableHeaderCell>Horizontal Accuracy</TableHeaderCell>
                    <TableHeaderCell>Serial Number</TableHeaderCell>
                    <TableHeaderCell>Model Number</TableHeaderCell>
                    <TableHeaderCell>Company ID</TableHeaderCell>
                    {/*
                    <TableHeaderCell>Group ID</TableHeaderCell>
                    <TableHeaderCell>Event Recorder ID</TableHeaderCell>
                    */}
                    <TableHeaderCell>Vehicle ID</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {gpsTableQuery.data.map((item) => (
                    <TableRow key={item.row}>
                      <TableCell>{item.timeInUTC}</TableCell>
                      <TableCell>{item.latitude}</TableCell>
                      <TableCell>{item.longitude}</TableCell>
                      <TableCell>{item.speed}</TableCell>
                      <TableCell>{item.heading}</TableCell>
                      <TableCell>{item.hdop}</TableCell>
                      <TableCell>{item.numsats}</TableCell>
                      <TableCell>{item.horizontalAccuracy}</TableCell>
                      <TableCell>{item.serialnumber}</TableCell>
                      <TableCell>{item.modelnumber}</TableCell>
                      <TableCell>{item.companyid}</TableCell>
                      {/*<TableCell>{item.groupid}</TableCell>
                      <TableCell>{item.eventrecorderid}</TableCell>
                      */}
                      <TableCell>{item.vehicleid}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Flex className="mt-4 space-x-2" justifyContent="center">
                <Text>Page</Text>
                <TextInput
                  className="w-4"
                  value={page}
                  onChange={ (event) => setPage(event.target.value) }
                />
              </Flex>
            </Card>
          </TabPanel>
        </TabPanels>
      </TabGroup>
      
      
      
    </main>
  );
}