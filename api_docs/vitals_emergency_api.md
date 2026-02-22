# Vitals & Emergency System Documentation

## Overview
This module handles the tracking of user vital signs and provides an emergency alert system to notify loved ones in critical situations.

## Vitals API

### 1. Push Vitals
Upload new vital sign measurements.

- **URL:** `/api/vitals/push/`
- **Method:** `POST`
- **Authentication:** Required (Token)
- **Request Body:**
  ```json
  {
    "heart_rate": 72,
    "blood_pressure_systolic": 120,
    "blood_pressure_diastolic": 80,
    "body_temperature": 36.6,
    "oxygen_saturation": 98,
    "blood_glucose": 90,
    "respiratory_rate": 16,
    "resting_heart_rate": 60,
    "vo2_max": 45
  }
  ```
- **Response:** `201 Created` with the saved data.

> **Note:** Sending a `GET` request to `/api/vitals/push/` 

### 2. Pull Vitals
Retrieve the most recent vital signs recording.

- **URL:** `/api/vitals/pull/`
- **Method:** `GET`
- **Authentication:** Public
- **Response:**
  ```json
  {
    "id": 1,
    "user": "username",
    "timestamp": "...",
    "heart_rate": 72,
    ...
  }
  ```

## Emergency API

### 1. Add Emergency Contact
Register a new contact to be notified in emergencies.

- **URL:** `/api/emergency/contacts/`
- **Method:** `POST`
- **Authentication:** Private
- **Request Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
  ```
- **Response:** `200 OK`

### 2. Send Emergency Alert
Trigger an email alert to all registered emergency contacts.

- **URL:** `/api/emergency/send/`
- **Method:** `POST`
- **Authentication:** Private
- **Content-Type:** `application/x-www-form-urlencoded` or `multipart/form-data`
- **Parameters:**
  - `name`: Name of the person in distress
  - `email`: Email of the person in distress
  - `reason`: Description of the emergency
  - `urgency_level`: Level of urgency (e.g., "High", "Critical")
- **Response:**
  ```json
  {
    "message": "Emergency alert sent to X contact(s)"
  }
  ```

## Models

### VitalSigns
Stores physiological data including:
- Heart Rate (bpm)
- Blood Pressure (Systolic/Diastolic)
- Body Temperature
- Oxygen Saturation
- Blood Glucose
- Respiratory Rate
- VO2 Max

### EmergencyContact
Stores contact information:
- Name
- Email
