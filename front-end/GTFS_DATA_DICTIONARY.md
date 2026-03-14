# GTFS Data Dictionary — Quick Reference

> **Purpose:** Quick-reference guide for working with Durham Region Transit GTFS data during the hackathon.

---

## Data Access

| Resource | URL |
|---|---|
| **GTFS Static Feed** | https://opendata.durham.ca/datasets/931bc536b42e4b3aa72270dab4133c90 |
| **Durham Open Data** | https://opendata.durham.ca/search?tags=Durham%20Transit |
| **Transitland** | https://www.transit.land/feeds/f-dpz-durhamregiontransit |
| **GTFS-RT (Realtime)** | https://www.transit.land/feeds/f-dpz-durhamregiontransit~rt |

---

## GTFS Schedule (Static) — File Summary

GTFS is distributed as a ZIP containing these CSV files:

| File | Purpose | Key Fields |
|---|---|---|
| `agency.txt` | Transit agency info | `agency_id`, `agency_name` |
| `stops.txt` | Stop/station locations | `stop_id`, `stop_code`, `stop_name`, `stop_lat`, `stop_lon` |
| `routes.txt` | Route definitions | `route_id`, `route_short_name`, `route_long_name`, `route_type` |
| `trips.txt` | Individual trips | `trip_id`, `route_id`, `service_id`, `direction_id` |
| `stop_times.txt` | Arrival/departure times | `trip_id`, `stop_id`, `arrival_time`, `departure_time`, `stop_sequence` |
| `calendar.txt` | Weekly service patterns | `service_id`, `monday`–`sunday`, `start_date`, `end_date` |
| `calendar_dates.txt` | Service exceptions | `service_id`, `date`, `exception_type` |
| `shapes.txt` | Route geometry | `shape_id`, `shape_pt_lat`, `shape_pt_lon`, `shape_pt_sequence` |

---

## stops.txt

Locations where vehicles pick up or drop off riders.

| Field | Type | Description |
|---|---|---|
| `stop_id` | ID | **Primary key.** Unique stop identifier |
| `stop_code` | Text | Rider-facing code (shown on signs) |
| `stop_name` | Text | Stop name |
| `stop_desc` | Text | Stop description |
| `stop_lat` | Float | Latitude (WGS84) |
| `stop_lon` | Float | Longitude (WGS84) |
| `zone_id` | ID | Fare zone |
| `stop_url` | URL | Stop info page |
| `location_type` | Enum | `0`=Stop, `1`=Station, `2`=Entrance, `3`=Node, `4`=Boarding Area |
| `parent_station` | ID | Parent station's `stop_id` |
| `wheelchair_boarding` | Enum | `0`=No info, `1`=Accessible, `2`=Not accessible |
| `platform_code` | Text | Platform identifier |

---

## routes.txt

Transit routes (e.g., bus lines).

| Field | Type | Description |
|---|---|---|
| `route_id` | ID | **Primary key.** Unique route identifier |
| `agency_id` | ID | Agency operating this route |
| `route_short_name` | Text | Short name (e.g., "401", "110") |
| `route_long_name` | Text | Full name (e.g., "Simcoe / Taunton") |
| `route_desc` | Text | Route description |
| `route_type` | Enum | `3`=Bus (most common for DRT) |
| `route_url` | URL | Route info page |
| `route_color` | Hex | Route color (e.g., "FF0000") |
| `route_text_color` | Hex | Text color on route background |

**Route Types:**
| Value | Mode |
|---|---|
| 0 | Tram/Light Rail |
| 1 | Subway/Metro |
| 2 | Rail |
| 3 | **Bus** |
| 4 | Ferry |

---

## trips.txt

A trip is a sequence of stops at specific times.

| Field | Type | Description |
|---|---|---|
| `route_id` | ID | Route this trip belongs to |
| `service_id` | ID | Calendar reference (when trip runs) |
| `trip_id` | ID | **Primary key.** Unique trip identifier |
| `trip_headsign` | Text | Destination shown on vehicle |
| `trip_short_name` | Text | Public trip name (e.g., train number) |
| `direction_id` | Enum | `0`=Outbound, `1`=Inbound |
| `block_id` | ID | Vehicle assignment block |
| `shape_id` | ID | Geographic path reference |
| `wheelchair_accessible` | Enum | `0`=No info, `1`=Yes, `2`=No |
| `bikes_allowed` | Enum | `0`=No info, `1`=Yes, `2`=No |

---

## stop_times.txt

When vehicles arrive/depart at each stop.

| Field | Type | Description |
|---|---|---|
| `trip_id` | ID | Trip this record belongs to |
| `arrival_time` | Time | Arrival time (HH:MM:SS) — can exceed 24:00:00 |
| `departure_time` | Time | Departure time (HH:MM:SS) |
| `stop_id` | ID | Stop reference |
| `stop_sequence` | Int | Order of stop in trip (1, 2, 3...) |
| `stop_headsign` | Text | Override headsign at this stop |
| `pickup_type` | Enum | `0`=Regular, `1`=None, `2`=Phone, `3`=Driver |
| `drop_off_type` | Enum | Same as pickup_type |
| `shape_dist_traveled` | Float | Distance along shape (meters) |
| `timepoint` | Enum | `0`=Approximate, `1`=Exact |

> **Note:** Times after midnight use 24+ hours (e.g., 25:30:00 = 1:30 AM next day).

---

## calendar.txt

Weekly service patterns.

| Field | Type | Description |
|---|---|---|
| `service_id` | ID | **Primary key.** Service identifier |
| `monday` | Enum | `1`=Runs, `0`=Doesn't run |
| `tuesday` | Enum | Same |
| `wednesday` | Enum | Same |
| `thursday` | Enum | Same |
| `friday` | Enum | Same |
| `saturday` | Enum | Same |
| `sunday` | Enum | Same |
| `start_date` | Date | Start date (YYYYMMDD) |
| `end_date` | Date | End date (YYYYMMDD) |

---

## calendar_dates.txt

Service exceptions (holidays, special events).

| Field | Type | Description |
|---|---|---|
| `service_id` | ID | Service being modified |
| `date` | Date | Exception date (YYYYMMDD) |
| `exception_type` | Enum | `1`=Service added, `2`=Service removed |

---

## shapes.txt

Geographic path of vehicle travel.

| Field | Type | Description |
|---|---|---|
| `shape_id` | ID | Shape identifier |
| `shape_pt_lat` | Float | Point latitude |
| `shape_pt_lon` | Float | Point longitude |
| `shape_pt_sequence` | Int | Point order |
| `shape_dist_traveled` | Float | Distance from start (meters) |

---

## GTFS Realtime — Feed Entities

GTFS-RT provides live updates via Protocol Buffers.

### VehiclePosition

Live vehicle locations.

| Field | Type | Description |
|---|---|---|
| `vehicle.id` | String | Internal vehicle ID |
| `vehicle.label` | String | Rider-facing vehicle number (bus number) |
| `position.latitude` | Float | Current latitude |
| `position.longitude` | Float | Current longitude |
| `position.bearing` | Float | Direction (degrees from north) |
| `position.speed` | Float | Speed (m/s) |
| `trip.trip_id` | String | Current trip |
| `trip.route_id` | String | Current route |
| `stop_id` | String | Current/next stop |
| `current_status` | Enum | `INCOMING_AT`, `STOPPED_AT`, `IN_TRANSIT_TO` |
| `timestamp` | Int | Position time (POSIX) |
| `occupancy_status` | Enum | `EMPTY`, `MANY_SEATS_AVAILABLE`, `FEW_SEATS_AVAILABLE`, `STANDING_ROOM_ONLY`, `FULL` |

### TripUpdate

Arrival/departure predictions.

| Field | Type | Description |
|---|---|---|
| `trip.trip_id` | String | Trip being updated |
| `trip.route_id` | String | Route |
| `trip.start_date` | String | Service date (YYYYMMDD) |
| `vehicle.id` | String | Vehicle serving trip |
| `stop_time_update[]` | Array | Per-stop predictions |
| `delay` | Int | Overall delay (seconds, positive=late) |
| `timestamp` | Int | Update time (POSIX) |

### StopTimeUpdate

Per-stop predictions (within TripUpdate).

| Field | Type | Description |
|---|---|---|
| `stop_sequence` | Int | Stop position in trip |
| `stop_id` | String | Stop identifier |
| `arrival.delay` | Int | Arrival delay (seconds) |
| `arrival.time` | Int | Predicted arrival (POSIX) |
| `departure.delay` | Int | Departure delay (seconds) |
| `departure.time` | Int | Predicted departure (POSIX) |
| `schedule_relationship` | Enum | `SCHEDULED`, `SKIPPED`, `NO_DATA` |

### ServiceAlert

Service disruptions.

| Field | Type | Description |
|---|---|---|
| `informed_entity[]` | Array | Affected routes/stops/trips |
| `cause` | Enum | `TECHNICAL_PROBLEM`, `WEATHER`, `CONSTRUCTION`, `ACCIDENT`, etc. |
| `effect` | Enum | `NO_SERVICE`, `REDUCED_SERVICE`, `DETOUR`, `SIGNIFICANT_DELAYS`, etc. |
| `header_text` | String | Alert headline |
| `description_text` | String | Alert details |
| `severity_level` | Enum | `INFO`, `WARNING`, `SEVERE` |
| `active_period[]` | Array | When alert is active (start/end times) |

---

## Quick Start — Python

### Install Libraries

```bash
pip install partridge gtfs-realtime-bindings requests pandas
```

### Load GTFS Static

```python
import partridge as ptg

feed = ptg.load_feed('gtfs.zip')

stops = feed.stops          # DataFrame
routes = feed.routes        # DataFrame
trips = feed.trips          # DataFrame
stop_times = feed.stop_times
```

### Parse GTFS Realtime

```python
from google.transit import gtfs_realtime_pb2
import requests

feed = gtfs_realtime_pb2.FeedMessage()
response = requests.get('REALTIME_FEED_URL')
feed.ParseFromString(response.content)

for entity in feed.entity:
    if entity.HasField('vehicle'):
        v = entity.vehicle
        print(f"{v.vehicle.label}: {v.position.latitude}, {v.position.longitude}")
```

### Join GTFS with PRESTO

```python
import pandas as pd
import partridge as ptg

feed = ptg.load_feed('gtfs.zip')
presto = pd.read_csv('2025_Dec_1-7_PRESTO_Ridership_Data.csv')

# Add stop coordinates to PRESTO data
merged = presto.merge(
    feed.stops[['stop_id', 'stop_lat', 'stop_lon']],
    left_on='trxlocationid',
    right_on='stop_id',
    how='left'
)
```

---

## Join Keys — Hackathon Datasets ↔ GTFS

| Hackathon Field | GTFS Field | Notes |
|---|---|---|
| PRESTO `trxlocationid` | `stops.stop_id` | Where fare tap occurred |
| PRESTO `loc_desc` | `stops.stop_name` | Stop name |
| Rate My Ride `stop_id` | `stops.stop_id` | Feedback location |
| Rate My Ride `stop_code` | `stops.stop_code` | Rider-facing stop code |
| Rate My Ride `stop_name` | `stops.stop_name` | Stop name |
| Rate My Ride `route_short_name` | `routes.route_short_name` | Route number |
| Rate My Ride `route_long_name` | `routes.route_long_name` | Route name |
| Rate My Ride `trip_id` | `trips.trip_id` | Specific trip |
| Rate My Ride `vehicle_id` | GTFS-RT `vehicle.id` | Vehicle tracking |
| Rate My Ride `vehicle_label` | GTFS-RT `vehicle.label` | Bus number |
| PM Maintenance `alias` | GTFS-RT `vehicle.label` | Bus number for maintenance correlation |

---

## Common Queries

### Get all stops on a route

```python
route_id = 'ROUTE_123'
trip_ids = feed.trips[feed.trips.route_id == route_id].trip_id
stop_ids = feed.stop_times[feed.stop_times.trip_id.isin(trip_ids)].stop_id.unique()
route_stops = feed.stops[feed.stops.stop_id.isin(stop_ids)]
```

### Get schedule for a stop

```python
stop_id = 'STOP_456'
times = feed.stop_times[feed.stop_times.stop_id == stop_id]
times_with_trips = times.merge(feed.trips, on='trip_id')
```

### Check if service runs on a date

```python
from datetime import datetime

date = datetime(2025, 12, 3)
day_name = date.strftime('%A').lower()

# Check calendar.txt
active = feed.calendar[
    (feed.calendar[day_name] == 1) &
    (feed.calendar.start_date <= date.strftime('%Y%m%d')) &
    (feed.calendar.end_date >= date.strftime('%Y%m%d'))
]
```

---

## Additional Resources

| Resource | URL |
|---|---|
| GTFS Schedule Reference | https://gtfs.org/documentation/schedule/reference/ |
| GTFS Realtime Reference | https://gtfs.org/documentation/realtime/reference/ |
| GTFS Best Practices | https://gtfs.org/documentation/schedule/schedule_best_practices/ |
| Python Bindings | https://gtfs.org/documentation/realtime/language-bindings/python/ |
| GTFS Validator | https://gtfs-validator.mobilitydata.org/ |
