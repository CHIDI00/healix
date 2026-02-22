# Health Metrics & Vitals API Documentation

## Overview

The Health Metrics API provides comprehensive endpoints for tracking user health data across multiple categories:
- **Vital Signs** - Core physiological measurements
- **Physical Data** - Body measurements and characteristics
- **Fitness Data** - Exercise and movement tracking
- **Nutrition** - Dietary intake tracking
- **Reproductive Health** - Menstrual and fertility tracking
- **Sleep** - Rest and recovery metrics

All endpoints require authentication via token-based authentication.

## Authentication

Include the authentication token in the `Authorization` header:
```
Authorization: Token <your-token-here>
```

---

## Endpoints

### Vital Signs

#### Create Vital Signs Record
**Endpoint:** `POST /api/vitals/`

**Permission:** Authenticated

**Request Body:**
```json
{
  "basal_body_temperature": 36.5,
  "blood_glucose": 100,
  "blood_pressure_systolic": 120,
  "blood_pressure_diastolic": 80,
  "body_temperature": 37.2,
  "heart_rate": 72,
  "oxygen_saturation": 98.5,
  "respiratory_rate": 16,
  "resting_heart_rate": 60,
  "vo2_max": 45.5
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "user": 1,
  "timestamp": "2026-02-21T10:30:00Z",
  "basal_body_temperature": 36.5,
  "blood_glucose": 100,
  "blood_pressure_systolic": 120,
  "blood_pressure_diastolic": 80,
  "body_temperature": 37.2,
  "heart_rate": 72,
  "oxygen_saturation": 98.5,
  "respiratory_rate": 16,
  "resting_heart_rate": 60,
  "vo2_max": 45.5
}
```

#### Get Vital Signs Records
**Endpoint:** `GET /api/vitals/`

**Permission:** Authenticated

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "user": 1,
    "timestamp": "2026-02-21T10:30:00Z",
    "basal_body_temperature": 36.5,
    "blood_glucose": 100,
    ...
  }
]
```

#### Get Single Vital Signs Record
**Endpoint:** `GET /api/vitals/{id}/`

#### Update Vital Signs Record
**Endpoint:** `PUT /api/vitals/{id}/` or `PATCH /api/vitals/{id}/`

#### Delete Vital Signs Record
**Endpoint:** `DELETE /api/vitals/{id}/`

---

### Physical Data

#### Create Physical Data Record
**Endpoint:** `POST /api/physical-data/`

**Request Body:**
```json
{
  "basal_metabolic_rate": 1500,
  "body_fat_percentage": 22.5,
  "bone_mass": 2.8,
  "height": 175,
  "lean_body_mass": 60,
  "weight": 75
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "user": 1,
  "timestamp": "2026-02-21T10:30:00Z",
  "basal_metabolic_rate": 1500,
  "body_fat_percentage": 22.5,
  "bone_mass": 2.8,
  "height": 175,
  "lean_body_mass": 60,
  "weight": 75
}
```

#### Get Physical Data Records
**Endpoint:** `GET /api/physical-data/`

#### Get Single Record
**Endpoint:** `GET /api/physical-data/{id}/`

#### Update Physical Data
**Endpoint:** `PUT /api/physical-data/{id}/` or `PATCH /api/physical-data/{id}/`

#### Delete Physical Data
**Endpoint:** `DELETE /api/physical-data/{id}/`

---

### Fitness Data

#### Create Fitness Record
**Endpoint:** `POST /api/fitness-data/`

**Request Body:**
```json
{
  "active_calories_burned": 500,
  "distance": 5.2,
  "elevation_gained": 120,
  "exercise_duration": 45,
  "exercise_type": "Running",
  "floors_climbed": 10,
  "power": 250,
  "speed": 10.5,
  "steps": 8500,
  "steps_cadence": 170,
  "total_calories_burned": 650,
  "wheelchair_pushes": null
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "user": 1,
  "timestamp": "2026-02-21T10:30:00Z",
  "active_calories_burned": 500,
  "distance": 5.2,
  "elevation_gained": 120,
  "exercise_duration": 45,
  "exercise_type": "Running",
  "floors_climbed": 10,
  "power": 250,
  "speed": 10.5,
  "steps": 8500,
  "steps_cadence": 170,
  "total_calories_burned": 650,
  "wheelchair_pushes": null
}
```

#### Get Fitness Records
**Endpoint:** `GET /api/fitness-data/`

#### Get Single Record
**Endpoint:** `GET /api/fitness-data/{id}/`

#### Update Fitness Data
**Endpoint:** `PUT /api/fitness-data/{id}/` or `PATCH /api/fitness-data/{id}/`

#### Delete Fitness Data
**Endpoint:** `DELETE /api/fitness-data/{id}/`

---

### Nutrition

#### Create Nutrition Record
**Endpoint:** `POST /api/nutrition/`

**Request Body:**
```json
{
  "hydration": 2000,
  "protein": 120,
  "carbohydrates": 300,
  "fats": 65,
  "calories": 2200,
  "fiber": 35,
  "sodium": 2300,
  "notes": "Healthy meals throughout the day"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "user": 1,
  "timestamp": "2026-02-21T10:30:00Z",
  "hydration": 2000,
  "protein": 120,
  "carbohydrates": 300,
  "fats": 65,
  "calories": 2200,
  "fiber": 35,
  "sodium": 2300,
  "notes": "Healthy meals throughout the day"
}
```

#### Get Nutrition Records
**Endpoint:** `GET /api/nutrition/`

#### Get Single Record
**Endpoint:** `GET /api/nutrition/{id}/`

#### Update Nutrition Data
**Endpoint:** `PUT /api/nutrition/{id}/` or `PATCH /api/nutrition/{id}/`

#### Delete Nutrition Data
**Endpoint:** `DELETE /api/nutrition/{id}/`

---

### Reproductive Health

#### Create Reproductive Health Record
**Endpoint:** `POST /api/reproductive-health/`

**Request Body:**
```json
{
  "date": "2026-02-21",
  "cervical_mucus": "watery",
  "menstruation_flow": "light",
  "menstruation_period_start": "2026-02-21",
  "menstruation_period_end": "2026-02-25",
  "ovulation_test": "positive",
  "notes": "High fertility indicators"
}
```

**Request Fields:**
| Field | Type | Values |
|-------|------|--------|
| cervical_mucus | string | dry, sticky, creamy, watery, egg_white |
| menstruation_flow | string | light, medium, heavy |
| ovulation_test | string | positive, negative, indeterminate |

**Response (201 Created):**
```json
{
  "id": 1,
  "user": 1,
  "timestamp": "2026-02-21T10:30:00Z",
  "date": "2026-02-21",
  "cervical_mucus": "watery",
  "menstruation_flow": "light",
  "menstruation_period_start": "2026-02-21",
  "menstruation_period_end": "2026-02-25",
  "ovulation_test": "positive",
  "notes": "High fertility indicators"
}
```

#### Get Reproductive Health Records
**Endpoint:** `GET /api/reproductive-health/`

#### Get Single Record
**Endpoint:** `GET /api/reproductive-health/{id}/`

#### Update Reproductive Health Data
**Endpoint:** `PUT /api/reproductive-health/{id}/` or `PATCH /api/reproductive-health/{id}/`

#### Delete Reproductive Health Data
**Endpoint:** `DELETE /api/reproductive-health/{id}/`

---

### Sleep

#### Create Sleep Record
**Endpoint:** `POST /api/sleep/`

**Request Body:**
```json
{
  "date": "2026-02-20",
  "sleep_duration": 480,
  "sleep_start_time": "23:00",
  "sleep_end_time": "07:00",
  "sleep_quality": "good",
  "deep_sleep_duration": 120,
  "light_sleep_duration": 240,
  "rem_sleep_duration": 90,
  "awake_duration": 30,
  "notes": "Slept well, no disturbances"
}
```

**Request Fields:**
| Field | Type | Values |
|-------|------|--------|
| sleep_quality | string | poor, fair, good, excellent |

**Response (201 Created):**
```json
{
  "id": 1,
  "user": 1,
  "timestamp": "2026-02-21T10:30:00Z",
  "date": "2026-02-20",
  "sleep_duration": 480,
  "sleep_start_time": "23:00",
  "sleep_end_time": "07:00",
  "sleep_quality": "good",
  "deep_sleep_duration": 120,
  "light_sleep_duration": 240,
  "rem_sleep_duration": 90,
  "awake_duration": 30,
  "notes": "Slept well, no disturbances"
}
```

#### Get Sleep Records
**Endpoint:** `GET /api/sleep/`

#### Get Single Record
**Endpoint:** `GET /api/sleep/{id}/`

#### Update Sleep Data
**Endpoint:** `PUT /api/sleep/{id}/` or `PATCH /api/sleep/{id}/`

#### Delete Sleep Data
**Endpoint:** `DELETE /api/sleep/{id}/`

---

## Query Parameters

All list endpoints support the following query parameters:

### Pagination
```
GET /api/vitals/?page=1&page_size=20
```

### Filtering by Date Range
```
GET /api/vitals/?timestamp__gte=2026-02-01&timestamp__lte=2026-02-28
GET /api/sleep/?date__gte=2026-02-01&date__lte=2026-02-28
```

### Ordering
```
GET /api/vitals/?ordering=-timestamp    # Most recent first
GET /api/vitals/?ordering=timestamp     # Oldest first
```

---

## Error Responses

### 400 Bad Request
```json
{
  "field_name": ["Error message"]
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

---

## Usage Examples

### Example 1: Log Daily Vitals
```bash
curl -X POST http://localhost:8000/api/vitals/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b" \
  -d '{
    "heart_rate": 72,
    "blood_pressure_systolic": 120,
    "blood_pressure_diastolic": 80,
    "body_temperature": 37.2,
    "oxygen_saturation": 98.5,
    "respiratory_rate": 16
  }'
```

### Example 2: Log Exercise Session
```bash
curl -X POST http://localhost:8000/api/fitness-data/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b" \
  -d '{
    "exercise_type": "Running",
    "exercise_duration": 45,
    "distance": 5.2,
    "steps": 8500,
    "active_calories_burned": 500,
    "total_calories_burned": 650
  }'
```

### Example 3: Track Daily Nutrition
```bash
curl -X POST http://localhost:8000/api/nutrition/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b" \
  -d '{
    "calories": 2200,
    "protein": 120,
    "carbohydrates": 300,
    "fats": 65,
    "hydration": 2000,
    "notes": "Balanced diet"
  }'
```

### Example 4: Log Sleep Session
```bash
curl -X POST http://localhost:8000/api/sleep/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b" \
  -d '{
    "date": "2026-02-20",
    "sleep_duration": 480,
    "sleep_start_time": "23:00",
    "sleep_end_time": "07:00",
    "sleep_quality": "good",
    "deep_sleep_duration": 120,
    "light_sleep_duration": 240,
    "rem_sleep_duration": 90
  }'
```

### Example 5: Get Recent Vitals
```bash
curl -X GET "http://localhost:8000/api/vitals/?ordering=-timestamp&page_size=10" \
  -H "Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b"
```

### Example 6: Get Fitness Data for Date Range
```bash
curl -X GET "http://localhost:8000/api/fitness-data/?timestamp__gte=2026-02-01&timestamp__lte=2026-02-28&ordering=-timestamp" \
  -H "Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b"
```

---

## Data Types & Units

### Vital Signs
| Field | Type | Unit |
|-------|------|------|
| basal_body_temperature | float | °C/°F |
| blood_glucose | float | mg/dL or mmol/L |
| blood_pressure_systolic | float | mmHg |
| blood_pressure_diastolic | float | mmHg |
| body_temperature | float | °C/°F |
| heart_rate | integer | bpm |
| oxygen_saturation | float | percentage (%) |
| respiratory_rate | integer | breaths/min |
| resting_heart_rate | integer | bpm |
| vo2_max | float | mL/(kg·min) |

### Physical Data
| Field | Type | Unit |
|-------|------|------|
| basal_metabolic_rate | float | kcal/day |
| body_fat_percentage | float | percentage (%) |
| bone_mass | float | kg/lb |
| height | float | cm/in |
| lean_body_mass | float | kg/lb |
| weight | float | kg/lb |

### Fitness Data
| Field | Type | Unit |
|-------|------|------|
| active_calories_burned | float | kcal |
| distance | float | km/miles |
| elevation_gained | float | m/ft |
| exercise_duration | integer | minutes |
| exercise_type | string | - |
| floors_climbed | integer | count |
| power | float | watts |
| speed | float | km/h or mph |
| steps | integer | count |
| steps_cadence | float | steps/min |
| total_calories_burned | float | kcal |
| wheelchair_pushes | integer | count |

### Nutrition
| Field | Type | Unit |
|-------|------|------|
| hydration | float | mL/oz |
| protein | float | grams |
| carbohydrates | float | grams |
| fats | float | grams |
| calories | float | kcal |
| fiber | float | grams |
| sodium | float | mg |
| notes | string | - |

### Reproductive Health
| Field | Type | Values |
|-------|------|--------|
| cervical_mucus | string | dry, sticky, creamy, watery, egg_white |
| menstruation_flow | string | light, medium, heavy |
| menstruation_period_start | date | YYYY-MM-DD |
| menstruation_period_end | date | YYYY-MM-DD |
| ovulation_test | string | positive, negative, indeterminate |
| notes | string | - |

### Sleep
| Field | Type | Unit |
|-------|------|------|
| sleep_duration | integer | minutes |
| sleep_start_time | time | HH:MM |
| sleep_end_time | time | HH:MM |
| sleep_quality | string | poor, fair, good, excellent |
| deep_sleep_duration | integer | minutes |
| light_sleep_duration | integer | minutes |
| rem_sleep_duration | integer | minutes |
| awake_duration | integer | minutes |
| notes | string | - |

---

## Notes

- All timestamp fields are automatically set and read-only
- User field is automatically populated from the authenticated user
- All metric fields are optional (nullable) - you can submit partial data
- Timestamps are returned in ISO 8601 format (UTC)
- All dates should be in YYYY-MM-DD format
- All times should be in HH:MM format (24-hour)

---

## Version

- **API Version:** 1.0
- **Framework:** Django REST Framework
- **Authentication Type:** Token
- **Last Updated:** February 21, 2026
