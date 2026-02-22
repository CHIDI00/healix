# Oraimo Watch Health Data Service

This service connects to Oraimo smartwatches via Bluetooth and streams real-time health metrics (Heart Rate, Blood Pressure, SpO2, etc.) to the Healix backend platform.

## Features

- ⌚ **Device Support**: Compatible with Oraimo Watch 2, Watch Pro, and Watch 5 Lite.
- 🔄 **Real-time Sync**: Streams vitals to Healix API at configurable intervals.
- 🔋 **Battery Monitoring**: Alerts on low battery status.
- 🛠️ **System Integration**: Can be installed as a systemd service for background operation.
- 💾 **Local Buffering**: Caches data locally if connection is lost.

## Prerequisites

- Python 3.6+
- Bluetooth adapter
- Linux (recommended for BlueZ) or Windows

## Installation

1. **Install Dependencies**
   ```bash
   pip install requests
   pip install pybluez
   ```

2. **Configuration**
   Ensure you have your Healix API token and User ID ready.

## Usage

### Manual Execution

Run the service directly from the command line:

```bash
python oraimo_watch_service.py --api-url "http://localhost:8000/api/vitals/push/" --token "your-auth-token" --user-id 1
```

![script runtime](image.png)
### Command Line Arguments

| Argument | Description | Required | Default |
|----------|-------------|----------|---------|
| `--api-url` | URL of the Healix Vitals API endpoint | Yes | - |
| `--token` | Authentication token for the API | Yes | - |
| `--user-id` | ID of the user the data belongs to | Yes | - |
| `--device-addr` | Bluetooth MAC address of the watch | No | Auto-discover |
| `--interval` | Sync interval in seconds | No | 30 |
| `--install` | Install as a systemd service | No | - |
| `--daemon` | Run in daemon mode (internal use) | No | - |

### Installing as a Service (Linux)

To run the bridge automatically at startup:

```bash
sudo python oraimo_watch_service.py --install
```

This will create a systemd service file and configure it to restart automatically on failure.

## Data Synced

The service captures and transmits:
- Heart Rate (bpm)
- Blood Pressure (Systolic/Diastolic)
- Body Temperature (°C)
- Oxygen Saturation (SpO2 %)
- Blood Glucose (mg/dL)
- Respiratory Rate (breaths/min)
- Battery Level