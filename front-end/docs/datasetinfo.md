# Workspace Structure

Annotated file and folder structure for this workspace as of 2026-03-14.

Notes:
- Files beginning with `~$` are temporary Excel lock files.
- The `__MACOSX` folder and `._*` files are macOS archive metadata, not source data.

```text
DurhamRegionTransitData-main/
|-- 2025 Dec 1-7 PRESTO Ridership Data.csv - One-week sample of PRESTO ridership tap transactions for December 1-7, 2025.
|-- 20260212 Preventative Maintenance Open Activities.csv - Sample "HotList" snapshot of open preventative maintenance work orders as of 2026-02-12.
|-- GTFS_DATA_DICTIONARY.md - Quick reference for Durham Region Transit GTFS static and realtime data fields.
|-- Maintenance 2026 Hackathon file descriptions.xlsx - Data dictionary and file description workbook for the maintenance dataset.
|-- NEW PM Service- Fluid and Filter Requirements June 19, 2025.xlsx - Reference sheet for preventative maintenance service fluid and filter requirements.
|-- PRESTO field definitions and data types.xlsx - Data dictionary for PRESTO ridership fields and data types.
|-- README.md - Main repository documentation describing the datasets and how they relate.
|-- Full MAINTENANCE/ - Expanded maintenance data folder with the full maintenance CSV and supporting reference workbooks.
|   |-- Maintenance 2026 Hackathon file descriptions.xlsx - Maintenance dataset description workbook copied into the full maintenance folder.
|   |-- NEW PM Service- Fluid and Filter Requirements June 19, 2025.xlsx - PM service requirements workbook copied into the full maintenance folder.
|   |-- Preventative Maintenance Open Activities.csv - Full preventative maintenance open activities dataset.
|   |-- ~$Maintenance 2026 Hackathon file descriptions.xlsx - Temporary Excel lock file for the maintenance description workbook.
|   `-- ~$NEW PM Service- Fluid and Filter Requirements June 19, 2025.xlsx - Temporary Excel lock file for the PM service requirements workbook.
|-- PRESTO/ - Monthly PRESTO ridership extracts and PRESTO reference documentation.
|   |-- 2025AprPRESTO/ - Extracted folder for April 2025 PRESTO data.
|   |   `-- 2025AprPRESTO.csv - April 2025 PRESTO transaction data.
|   |-- 2025AugPRESTO/ - Extracted folder for August 2025 PRESTO data.
|   |   `-- 2025AugPRESTO.csv - August 2025 PRESTO transaction data.
|   |-- 2025DecPRESTO/ - Extracted folder for December 2025 PRESTO data.
|   |   `-- 2025DecPRESTO.csv - December 2025 PRESTO transaction data.
|   |-- 2025FebPRESTO/ - Extracted folder for February 2025 PRESTO data.
|   |   `-- 2025FebPRESTO.csv - February 2025 PRESTO transaction data.
|   |-- 2025JanPRESTO/ - Extracted folder for January 2025 PRESTO data.
|   |   `-- 2025JanPRESTO.csv - January 2025 PRESTO transaction data.
|   |-- 2025JulPRESTO/ - Extracted folder for July 2025 PRESTO data.
|   |   `-- 2025JulPRESTO.csv - July 2025 PRESTO transaction data.
|   |-- 2025JunPRESTO/ - Extracted folder for June 2025 PRESTO data.
|   |   `-- 2025JunPRESTO.csv - June 2025 PRESTO transaction data.
|   |-- 2025MarPRESTO/ - Extracted folder for March 2025 PRESTO data.
|   |   `-- 2025MarPRESTO.csv - March 2025 PRESTO transaction data.
|   |-- 2025MayPRESTO/ - Extracted folder for May 2025 PRESTO data.
|   |   `-- 2025MayPRESTO.csv - May 2025 PRESTO transaction data.
|   |-- 2025NovPRESTO/ - Extracted folder for November 2025 PRESTO data.
|   |   `-- 2025NovPRESTO.csv - November 2025 PRESTO transaction data.
|   |-- 2025OctPRESTO/ - Extracted folder for October 2025 PRESTO data.
|   |   `-- 2025OctPRESTO.csv - October 2025 PRESTO transaction data.
|   |-- 2025SepPRESTO/ - Extracted folder for September 2025 PRESTO data.
|   |   `-- 2025SepPRESTO.csv - September 2025 PRESTO transaction data.
|   `-- PRESTO field definitions and data types.xlsx - PRESTO data dictionary stored with the monthly PRESTO files.
`-- RATE MY RIDE/ - Rider feedback data exported from the Transit app's Rate My Ride feature.
    |-- DRTON_rate_my_ride.csv - Survey response dataset with rider feedback, route, stop, trip, and vehicle context.
    `-- __MACOSX/ - Metadata folder created when the archive was made on macOS.
        `-- ._DRTON_rate_my_ride.csv - macOS resource metadata for the CSV, not actual ridership or feedback data.
```