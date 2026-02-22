# Healix Project Documentation

## 1. Executive Summary
Healix is an integrated AI-powered healthcare platform designed to monitor user health data from wearable devices and provide personalized, context-aware health insights using advanced Large Language Models (LLMs).

## 2. System Architecture

The system follows a modular architecture consisting of three main components:

### A. The Backend Server (`healix_server`)
- **Framework**: Django REST Framework (DRF).
- **Role**: Acts as the central hub for data storage, user authentication, and API management.
- **Key Modules**:
    - `assistant`: Handles AI interactions, prompt engineering, and tool execution.
    - `vitals`: Manages health data ingestion and retrieval.
    - `users`: Handles authentication and user profiles.

### B. The AI Engine (RAG System)
- **Model**: Google Gemini (Supports Gemini 1.5 Pro and Gemini 2.5 Flash).
- **Mechanism**: Retrieval-Augmented Generation (RAG).
- **Workflow**:
    1. User sends a query.
    2. System retrieves relevant health metrics (heart rate, sleep, activity) from the database.
    3. Data is injected into the LLM context.
    4. AI generates a personalized response or executes a specific tool (e.g., BMI calculator).

### C. Hardware Interface Layer
- **Service**: `oraimo_watch_service.py`
- **Protocol**: Bluetooth (using `pybluez`).
- **Function**: Connects to Oraimo smartwatches, reads raw BLE data, parses it, and pushes it to the Backend API.

## 3. Technologies Stack

| Component | Technology | Description |
|-----------|------------|-------------|
| **Backend** | Python 3.8+, Django 4.x | Core server logic and ORM |
| **API** | Django REST Framework | RESTful API endpoints |
| **AI/LLM** | Google Generative AI SDK | Interface for Gemini models |
| **Database** | SQLite / PostgreSQL | Relational data storage |
| **Hardware** | PyBluez, Requests | Bluetooth communication and HTTP syncing |
| **Environment** | Python-dotenv | Configuration management |

## 4. Key Features

### 🩺 Real-time Vitals Monitoring
- Continuous tracking of Heart Rate, Blood Pressure, SpO2, and Respiratory Rate.
- Automatic synchronization from supported wearable devices.

### 🤖 Context-Aware AI Assistant
- **Personalized Advice**: "Based on your heart rate of 72 bpm..."
- **Tool Use**: Can dynamically calculate BMI, daily calorie needs, and macro splits.
- **Memory**: Maintains conversation history for continuity.

### 🚨 Emergency & Alerts
- System capability to trigger alerts based on vital sign anomalies (e.g., `send_health_alert` tool).

## 5. Data Flow

1. **Ingestion**: 
   `Watch` --(Bluetooth)--> `Hardware Service` --(HTTP POST)--> `Backend API` --(ORM)--> `Database`

2. **Intelligence**:
   `User Query` --> `Chat Endpoint` --> `RAG Retriever` (fetches DB data) --> `Gemini LLM` --> `Response`

## 6. Directory Structure Overview

```
healix/
├── backend/                 # Django Backend
│   ├── healix_server/       # Application Source
│   │   ├── assistant/       # AI & RAG Logic
│   │   └── ...
│   └── ...
├── hardware_interface/      # Watch Connection Scripts
├── api_docs/                # API Documentation
└── ...
```