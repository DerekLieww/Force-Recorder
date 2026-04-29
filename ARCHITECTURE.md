# Force Recorder — Architecture Design Document

**Version:** 1.1  
**Date:** 2026-04-27  
**Author:** Derek Liew

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Technology Stack](#2-technology-stack)
3. [High-Level Architecture](#3-high-level-architecture)
4. [Component Architecture](#4-component-architecture)
5. [State Management](#5-state-management)
6. [Data Flow — Force Measurement Pipeline](#6-data-flow--force-measurement-pipeline)
7. [Data Flow — Authentication & Persistence](#7-data-flow--authentication--persistence)
8. [Service Layer](#8-service-layer)
9. [Bluetooth Protocol](#9-bluetooth-protocol)
10. [Google Sheets Schema](#10-google-sheets-schema)
11. [Security Architecture](#11-security-architecture)
12. [Deployment Architecture](#12-deployment-architecture)
13. [Key Design Decisions](#13-key-design-decisions)
14. [Module Dependency Graph](#14-module-dependency-graph)
15. [Render Optimization Strategy](#15-render-optimization-strategy)
16. [Error Handling & Resilience](#16-error-handling--resilience)
17. [Force Conversion Math](#17-force-conversion-math)
18. [Theme System](#18-theme-system)
19. [Sequence — Tare Operation](#19-sequence--tare-operation)
20. [Sequence — Person History Load](#20-sequence--person-history-load)
21. [Environment & Configuration Reference](#21-environment--configuration-reference)
22. [Browser Compatibility](#22-browser-compatibility)
23. [Potential Future Architecture](#23-potential-future-architecture)

---

## 1. System Overview

Force Recorder is a browser-based single-page application for recording and tracking strength testing data from the **Tindeq Progressor** dynamometer. It connects to the device over **Web Bluetooth**, captures live force readings, and persists test results to **Google Sheets** for longitudinal tracking.

**Core capabilities:**

- Real-time force measurement via BLE at ~100 Hz
- Per-person historical tracking with chart visualization
- Google OAuth authentication gating persistence
- Unit conversion (Newtons / lbs / kg)
- Dark mode, offline-compatible UI
- Guided PIMA training sessions with live force graphing and orange/green rep-state feedback

**Design principles:**

- Zero backend — all logic runs client-side
- Stateless service singletons — easy to call anywhere
- Reactive UI via Zustand stores — components subscribe only to what they need
- Browser-standard APIs only (Web Bluetooth, Fetch, OAuth)

---

## 2. Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| UI Framework | React | 18.3.1 | Component rendering, lifecycle |
| Language | TypeScript | 5.5.3 | Type safety across all layers |
| State | Zustand | 4.5.2 | Lightweight reactive stores |
| Charts | Recharts | 3.8.1 | Historical force line charts |
| Auth | @react-oauth/google | 0.12.1 | Google OAuth 2.0 PKCE flow |
| HTTP | Axios | 1.15.0 | Google userinfo endpoint |
| Dates | date-fns | 3.3.1 | ISO 8601 timestamp formatting |
| Icons | lucide-react | 0.344.0 | UI iconography |
| Styling | Tailwind CSS | 3.4.1 | Utility-first CSS |
| Build | Vite | 8.0.8 | ES module bundler, HMR |
| Hardware | Web Bluetooth API | Browser | BLE device communication |
| Storage | Google Sheets REST v4 | - | Remote data persistence |

---

## 3. High-Level Architecture

```mermaid
graph TB
    subgraph Browser["Browser — Chrome / Edge"]
        subgraph UI["Presentation Layer"]
            App("App.tsx")
            Components("React Components")
        end

        subgraph State["State Layer — Zustand"]
            AuthStore[("authStore")]
            BTStore[("bluetoothStore")]
            ForceStore[("forceStore")]
            HistoryStore[("historyStore")]
            NamesStore[("namesStore")]
            TrainingStore[("trainingStore")]
        end

        subgraph Services["Service Layer"]
            BTService["BluetoothService"]
            SheetsService["GoogleSheetsService"]
        end

        subgraph Utils["Utilities"]
            Parser["BLE Parser"]
            Converter["Force Converter"]
            Theme["useTheme"]
        end
    end

    subgraph External["External Systems"]
        Progressor(["Tindeq Progressor · BLE"])
        GoogleAuth(["Google OAuth 2.0"])
        GoogleSheets(["Google Sheets REST API"])
        GoogleDrive(["Google Drive REST API"])
    end

    subgraph Storage["Browser Storage"]
        LocalStorage[("localStorage")]
    end

    Components --> State
    Components --> Services
    Services --> State
    Services --> Utils
    BTService <-->|"Web Bluetooth"| Progressor
    SheetsService <-->|"HTTPS / Bearer"| GoogleSheets
    SheetsService <-->|"HTTPS / Bearer"| GoogleDrive
    Components <-->|"OAuth Popup"| GoogleAuth
    Theme <--> LocalStorage

    classDef component fill:#1e3a5f,stroke:#3b82f6,color:#e2e8f0
    classDef store fill:#2d1b4e,stroke:#8b5cf6,color:#e2e8f0
    classDef service fill:#14402f,stroke:#22c55e,color:#e2e8f0
    classDef external fill:#3d1f00,stroke:#f97316,color:#e2e8f0
    classDef util fill:#3d3400,stroke:#eab308,color:#e2e8f0
    classDef storage fill:#1a2744,stroke:#60a5fa,color:#e2e8f0

    class App,Components component
    class AuthStore,BTStore,ForceStore,HistoryStore,NamesStore,TrainingStore store
    class BTService,SheetsService service
    class Progressor,GoogleAuth,GoogleSheets,GoogleDrive external
    class Parser,Converter,Theme util
    class LocalStorage storage
```

---

## 4. Component Architecture

### 4.1 Component Tree

```mermaid
graph TD
    App("App · GoogleOAuthProvider wrapper")

    App --> Header["header · title + DarkModeToggle"]
    App --> TabBar["tab bar · Force Test / Training"]
    App --> Main

    Main --> ForceTestTab["Force Test tab"]
    Main --> TrainingTabComp("TrainingTab")

    ForceTestTab --> Left["Left Column"]
    ForceTestTab --> Right["Right Column"]

    Left --> BTControl("BluetoothControl")
    Left --> ForceDisplay("ForceDisplay · live readout")
    Left --> Div1["person + test controls"]

    BTControl --> BTStatus("BluetoothStatus · connection indicator")
    BTControl --> DeviceSelector("DeviceSelector · scan & connect modal")
    DeviceSelector --> Modal("Modal")
    Modal --> DeviceList("DeviceList")

    Div1 --> PersonSelector("PersonSelector · autocomplete dropdown")
    Div1 --> ForceTest("ForceTest · Record / Reset / Tare")

    Right --> Div2["auth + history"]
    Div2 --> GoogleAuth("GoogleAuth")
    Div2 --> HistoryChart("HistoryChart · Recharts LineChart")
    GoogleAuth --> UserProfile("UserProfile · avatar + logout")
    GoogleAuth --> SheetsStatus("GoogleSheetsStatus · create / verify sheet")

    TrainingTabComp --> RoutineSelector("RoutineSelector · routine cards + MVC input")
    TrainingTabComp --> HandIndicator("HandIndicator · SVG left/right hands")
    TrainingTabComp --> TrainingGraph("TrainingGraph · Recharts AreaChart")
    TrainingTabComp --> SessionProgress("SessionProgress · set/rep/rest countdown")
    TrainingTabComp --> SessionControls("SessionControls · Start / Stop")

    classDef container fill:#1e3a5f,stroke:#3b82f6,color:#e2e8f0
    classDef feature fill:#14402f,stroke:#22c55e,color:#e2e8f0
    classDef layout fill:#1a1a2e,stroke:#475569,color:#94a3b8

    class App,BTControl,TrainingTabComp container
    class ForceDisplay,BTStatus,DeviceSelector,Modal,DeviceList,PersonSelector,ForceTest,HistoryChart,GoogleAuth,UserProfile,SheetsStatus,RoutineSelector,HandIndicator,TrainingGraph,SessionProgress,SessionControls feature
    class Header,TabBar,Main,Left,Right,Div1,Div2,ForceTestTab layout
```

### 4.2 Component Responsibilities

```mermaid
classDiagram
    class App {
        +GoogleOAuthProvider wrapper
        +2-column responsive layout
        +clientId from env
    }

    class BluetoothControl {
        +Composition container
        +No local state
    }

    class DeviceSelector {
        +isScanning: boolean
        +showModal: boolean
        +devices: BluetoothDevice[]
        +handleScan()
        +handleSelectDevice(id)
        +handleDisconnect()
    }

    class ForceDisplay {
        +Subscribes: forceStore
        +currentForce: number
        +highestForce: number
        +Displays in N / lbs / kg
    }

    class ForceTest {
        +saved: boolean
        +handleRecord()
        +handleReset()
        +handleTare()
    }

    class PersonSelector {
        +inputValue: string
        +isOpen: boolean
        +filteredNames: string[]
        +handleSelect(name)
        +loadHistory(name)
    }

    class HistoryChart {
        +unit: kg | lbs
        +Subscribes: historyStore
        +LineChart with tooltip
    }

    class GoogleAuth {
        +useGoogleLogin hook
        +handleSuccess(token)
        +handleLogout()
    }

    class GoogleSheetsStatus {
        +sheetExists: boolean
        +isChecking: boolean
        +isCreating: boolean
        +error: string | null
        +handleCreateSheet()
    }

    BluetoothControl --> DeviceSelector
    BluetoothControl --> BluetoothStatus
    GoogleAuth --> UserProfile
    GoogleAuth --> GoogleSheetsStatus
```

---

## 5. State Management

Six independent Zustand stores. Each component subscribes only to the slice it needs, preventing unnecessary re-renders.

```mermaid
graph LR
    subgraph Stores["Zustand Stores"]
        AuthStore[("authStore<br/>─────────<br/>isAuthenticated: bool<br/>userInfo: UserInfo | null")]
        BTStore[("bluetoothStore<br/>─────────<br/>isConnected: bool<br/>isConnecting: bool")]
        ForceStore[("forceStore<br/>─────────<br/>readings: ForceReading[]<br/>isRecording: bool<br/>selectedPerson: string | null<br/>highestForce: number")]
        HistoryStore[("historyStore<br/>─────────<br/>history: HistoryEntry[]<br/>isLoadingHistory: bool")]
        NamesStore[("namesStore<br/>─────────<br/>localNames: string[]")]
        TrainingStore[("trainingStore<br/>─────────<br/>routine: RoutineId | null<br/>mvc: number (lbs)<br/>phase: idle|rep|rest|complete<br/>colorState: neutral|orange|green<br/>activeHand: left|right<br/>currentRep/Set: number<br/>repGraphData: RepDataPoint[]")]
    end

    subgraph Writers["State Writers"]
        GoogleAuth -->|"setAuthenticated<br/>setUserInfo"| AuthStore
        DeviceSelector -->|"setConnected<br/>setConnecting"| BTStore
        BluetoothService -->|"addReading"| ForceStore
        ForceTest -->|"resetHighestForce"| ForceStore
        PersonSelector -->|"setSelectedPerson"| ForceStore
        SheetsService -->|"setHistory<br/>setLoadingHistory"| HistoryStore
        SheetsService -->|"setLocalNames<br/>addLocalName"| NamesStore
    end

    subgraph Readers["State Readers"]
        ForceDisplay -->|"reads"| ForceStore
        HistoryChart -->|"reads"| HistoryStore
        HistoryChart -->|"reads"| ForceStore
        PersonSelector -->|"reads"| NamesStore
        PersonSelector -->|"reads"| AuthStore
        BTStatus -->|"reads"| BTStore
    end

    classDef store fill:#2d1b4e,stroke:#8b5cf6,color:#e2e8f0
    classDef component fill:#1e3a5f,stroke:#3b82f6,color:#e2e8f0

    class AuthStore,BTStore,ForceStore,HistoryStore,NamesStore,TrainingStore store
    class GoogleAuth,DeviceSelector,BluetoothService,ForceTest,PersonSelector,SheetsService,ForceDisplay,HistoryChart,BTStatus component
```

### 5.1 Store Interaction Matrix

| Store | Written By | Read By | Persistence |
|-------|-----------|---------|-------------|
| `authStore` | GoogleAuth | PersonSelector, SheetsStatus, ForceTest | None (session) |
| `bluetoothStore` | DeviceSelector | BluetoothStatus, DeviceSelector | None (session) |
| `forceStore` | BluetoothService, ForceTest, PersonSelector | ForceDisplay, ForceTest, HistoryChart, trainingStore subscriber | None (session) |
| `historyStore` | GoogleSheetsService | HistoryChart | Remote (Sheets) |
| `namesStore` | GoogleSheetsService | PersonSelector | Remote (Sheets) |
| `trainingStore` | trainingStore subscriber (forceStore), SessionControls, RoutineSelector | TrainingTab, TrainingGraph, SessionProgress, HandIndicator, SessionControls | None (session) |

---

## 6. Data Flow — Force Measurement Pipeline

```mermaid
sequenceDiagram
    autonumber
    box rgb(30,58,95) Browser
    participant User
    participant DeviceSelector
    participant BluetoothService
    participant ForceReader
    participant Parser
    participant bluetoothStore
    participant ForceStore
    participant ForceDisplay
    participant ForceTest
    participant GoogleSheetsService
    end
    box rgb(61,31,0) BLE Device
    participant BLEDevice as Tindeq Progressor
    end

    User->>DeviceSelector: Click "Scan"
    DeviceSelector->>BluetoothService: scanForDevices()
    BluetoothService->>BLEDevice: navigator.bluetooth.requestDevice()
    BLEDevice-->>BluetoothService: BluetoothDevice
    BluetoothService-->>DeviceSelector: devices[]

    User->>DeviceSelector: Select device
    DeviceSelector->>BluetoothService: connectToDevice(deviceId)
    BluetoothService->>BLEDevice: gatt.connect()
    BLEDevice-->>BluetoothService: BluetoothRemoteGATTServer
    BluetoothService->>ForceReader: initialize(server)
    ForceReader->>BLEDevice: getCharacteristic(NOTIFY_UUID)
    ForceReader->>BLEDevice: startNotifications()
    BluetoothService->>BLEDevice: startSampling() → 0x65
    BluetoothService-->>DeviceSelector: connected
    DeviceSelector->>bluetoothStore: setConnected(true)

    loop ~100 Hz
        BLEDevice->>ForceReader: characteristicvaluechanged event
        ForceReader->>Parser: parseTindeqData(DataView)
        Parser-->>ForceReader: force (Newtons)
        ForceReader->>ForceStore: addReading({ timestamp, force })
        ForceStore-->>ForceDisplay: re-render (currentForce, highestForce)
    end

    User->>ForceTest: Click "Record"
    ForceTest->>ForceStore: read highestForce, selectedPerson
    ForceTest->>GoogleSheetsService: appendTestResult(name, force, timestamp)
    ForceTest->>ForceStore: resetHighestForce()
    ForceTest-->>User: Show "Saved!" flash
```

### 6.1 BLE Data Parsing Detail

```mermaid
graph LR
    subgraph BLEPacket["BLE Characteristic Value — DataView"]
        B0["Byte 0 · opcode"]
        B1["Byte 1 · status"]
        B2_5["Bytes 2–5<br/>float32 LE · raw weight kg"]
        B6_end["Bytes 6+ · ignored"]
    end

    B2_5 -->|"getFloat32(2, true)"| Weight("weight · kg")
    Weight -->|"Math.round(× 22.04) / 10"| Newtons("force · N")
    Newtons -->|"max(force, 0)"| Clamped("clamped force · N")
    Clamped --> ForceReading[("ForceReading<br/>{ timestamp: Date.now(), force: number }")]

    classDef ignored fill:#1a1a2e,stroke:#475569,color:#64748b
    classDef raw fill:#3d1f00,stroke:#f97316,color:#e2e8f0
    classDef processed fill:#14402f,stroke:#22c55e,color:#e2e8f0
    classDef output fill:#2d1b4e,stroke:#8b5cf6,color:#e2e8f0

    class B0,B1,B6_end ignored
    class B2_5 raw
    class Weight,Newtons,Clamped processed
    class ForceReading output
```

---

## 7. Data Flow — Authentication & Persistence

```mermaid
sequenceDiagram
    autonumber
    box rgb(30,58,95) Browser
    participant User
    participant GoogleAuth as GoogleAuth Component
    participant AuthStore
    participant SheetsService as GoogleSheetsService
    participant HistoryStore
    participant PersonSelector
    end
    box rgb(61,31,0) Google Cloud
    participant OAuthProvider as Google OAuth 2.0
    participant GoogleAPI as Google APIs
    participant DriveAPI as Google Drive API
    participant SheetsAPI as Google Sheets API
    end

    User->>GoogleAuth: Click "Sign in with Google"
    GoogleAuth->>OAuthProvider: useGoogleLogin() → OAuth popup
    OAuthProvider-->>GoogleAuth: { access_token }
    GoogleAuth->>GoogleAPI: GET /oauth2/v1/userinfo (Bearer token)
    GoogleAPI-->>GoogleAuth: { email, name, picture }
    GoogleAuth->>AuthStore: setAuthenticated(true), setUserInfo(info)
    GoogleAuth->>SheetsService: setAccessToken(token)

    Note over GoogleAuth,SheetsAPI: Sheet discovery
    GoogleAuth->>SheetsService: checkSpreadsheetExists()
    SheetsService->>DriveAPI: GET /drive/v3/files?q="Tindeq Force Logger"
    DriveAPI-->>SheetsService: { files: [] } or { files: [{ id }] }
    alt Sheet not found
        SheetsService-->>GoogleAuth: false
        User->>GoogleAuth: Click "Create Sheet"
        GoogleAuth->>SheetsService: createSpreadsheet()
        SheetsService->>SheetsAPI: POST /spreadsheets (Overview + Data sheets)
        SheetsAPI-->>SheetsService: { spreadsheetId }
    else Sheet found
        SheetsService-->>GoogleAuth: true
    end

    Note over PersonSelector,SheetsAPI: Name loading
    PersonSelector->>SheetsService: getNames()
    SheetsService->>SheetsAPI: GET /spreadsheets/{id}/values/Overview!A:A
    SheetsAPI-->>SheetsService: names[]
    SheetsService-->>PersonSelector: names[]

    User->>PersonSelector: Select person
    PersonSelector->>SheetsService: getHistoryForPerson(name)
    SheetsService->>SheetsAPI: GET /spreadsheets/{id}/values/Data!A:F
    SheetsAPI-->>SheetsService: rows[][]
    SheetsService-->>HistoryStore: setHistory(filtered entries)
```

---

## 8. Service Layer

### 8.1 BluetoothService Architecture

```mermaid
classDiagram
    class BluetoothService {
        -connection: BluetoothConnection
        -forceReader: ForceReader
        +scanForDevices() BluetoothDevice[]
        +connectToDevice(deviceId) void
        +disconnect() void
        +tare() void
        +startSampling() void
        +stopSampling() void
        +isConnected() boolean
        +getConnectedDevice() BluetoothDevice
    }

    class BluetoothConnection {
        -device: BluetoothDevice
        -server: BluetoothRemoteGATTServer
        +scanForDevices() BluetoothDevice[]
        +connect(deviceId) BluetoothRemoteGATTServer
        +disconnect() void
        +isConnected() boolean
        +getConnectedDevice() BluetoothDevice
    }

    class ForceReader {
        -characteristic: BluetoothRemoteGATTCharacteristic
        -controlCharacteristic: BluetoothRemoteGATTCharacteristic
        -onForceUpdate: Function | null
        +initialize(server) void
        +startNotifications() void
        +stopNotifications() void
        +startSampling() void
        +stopSampling() void
        +tare() void
        +disconnect() void
        +setForceUpdateCallback(cb) void
        -handleForceReading(event) void
    }

    class Parser {
        +parseTindeqData(dataView) number
    }

    BluetoothService --> BluetoothConnection
    BluetoothService --> ForceReader
    ForceReader --> Parser
```

### 8.2 GoogleSheetsService Architecture

```mermaid
classDiagram
    class GoogleSheetsService {
        -accessToken: String
        -spreadsheetId: String
        +setAccessToken(token) void
        +checkSpreadsheetExists() boolean
        +createSpreadsheet() void
        +getNames() String[]
        +appendTestResult(name, force, ts) void
        +getHistoryForPerson(name) HistoryEntry[]
        -findSpreadsheet() String
        -getSpreadsheetId() String
    }
    class GoogleSheetsAPI {
        <<external>>
        +POST_spreadsheets()
        +GET_spreadsheets_values(id, range)
        +PUT_spreadsheets_values(id, range)
        +POST_spreadsheets_values_append(id, range)
    }
    class GoogleDriveAPI {
        <<external>>
        +GET_files(query)
    }
    GoogleSheetsService --> GoogleSheetsAPI : Bearer token
    GoogleSheetsService --> GoogleDriveAPI : Bearer token
```

---

## 9. Bluetooth Protocol

### 9.1 BLE Service & Characteristic Map

```mermaid
graph TB
    BluetoothService["BluetoothService"]
    ForceReader["ForceReader"]

    subgraph TindeqService["Tindeq GATT Service · 7e4e1701-..."]
        NotifyChar["Notify Characteristic<br/>7e4e1702-... · READ + NOTIFY<br/>Force readings"]
        ControlChar["Control Characteristic<br/>7e4e1703-... · WRITE<br/>Commands"]
    end

    subgraph Commands["Control Commands"]
        Start("0x65 · START_SAMPLING")
        Stop("0x66 · STOP_SAMPLING")
        Tare("0x64 · TARE")
        Disconnect("0x6E · DISCONNECT")
    end

    BluetoothService -->|"writeValue"| ControlChar
    ControlChar --> Start
    ControlChar --> Stop
    ControlChar --> Tare
    ControlChar --> Disconnect
    NotifyChar -->|"characteristicvaluechanged @ ~100 Hz"| ForceReader

    classDef svc fill:#1e3a5f,stroke:#3b82f6,color:#e2e8f0
    classDef char fill:#2d1b4e,stroke:#8b5cf6,color:#e2e8f0
    classDef cmd fill:#14402f,stroke:#22c55e,color:#e2e8f0

    class BluetoothService,ForceReader svc
    class NotifyChar,ControlChar char
    class Start,Stop,Tare,Disconnect cmd
```

### 9.2 Connection State Machine

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#1e3a5f', 'primaryTextColor': '#e2e8f0', 'primaryBorderColor': '#3b82f6', 'lineColor': '#64748b', 'secondaryColor': '#14402f', 'tertiaryColor': '#2d1b4e', 'background': '#0f172a'}}}%%
stateDiagram-v2
    [*] --> Disconnected

    Disconnected --> Scanning : scanForDevices()
    Scanning --> Disconnected : User cancels / no devices
    Scanning --> Connecting : selectDevice(id)

    Connecting --> Connected : gatt.connect() + startNotifications()
    Connecting --> Disconnected : Connection error

    Connected --> Sampling : startSampling() → 0x65
    Sampling --> Connected : stopSampling() → 0x66
    Sampling --> Disconnected : gattserverdisconnected event
    Connected --> Disconnected : disconnect() / device off
```

---

## 10. Google Sheets Schema

### 10.1 Spreadsheet Structure

```
Spreadsheet: "Tindeq Force Logger"
├── Sheet: "Data"           (append-only test results)
│   ├── A1: Timestamp
│   ├── B1: Name
│   ├── C1: Force (N)
│   ├── D1: Force (lbs)
│   ├── E1: Force (kg)
│   └── F1: Notes
│
└── Sheet: "Overview"       (derived aggregates)
    ├── A1: Names
    └── A2: =UNIQUE(Data!B2:B)   ← Google Sheets formula
```

### 10.2 Data Flow to Sheets

```mermaid
flowchart LR
    ForceTest("ForceTest") -->|"name, highestForce, Date.now()"| AppendFn

    subgraph AppendFn["appendTestResult()"]
        TS["format(ts, 'yyyy-MM-dd HH:mm:ss')"]
        Conv["convertForce(N)<br/>→ { lbs, kg }"]
        Row["[ timestamp, name, N, lbs, kg, '' ]"]
    end

    AppendFn -->|"POST :append · Data!A:F"| SheetsAPI[("Google Sheets API")]
    SheetsAPI -->|"UNIQUE formula auto-updates"| Overview[("Overview!A2:A<br/>names list")]
    Overview -->|"getNames()"| PersonSelector("PersonSelector")

    classDef component fill:#1e3a5f,stroke:#3b82f6,color:#e2e8f0
    classDef fn fill:#14402f,stroke:#22c55e,color:#e2e8f0
    classDef external fill:#3d1f00,stroke:#f97316,color:#e2e8f0

    class ForceTest,PersonSelector component
    class TS,Conv,Row fn
    class SheetsAPI,Overview external
```

---

## 11. Security Architecture

```mermaid
graph TB
    subgraph Browser["Browser Security Context"]
        COOP["Cross-Origin-Opener-Policy<br/>same-origin-allow-popups<br/>enables OAuth popup"]
        COEP["Cross-Origin-Embedder-Policy<br/>require-corp<br/>enables Web Bluetooth"]
        HTTPS["HTTPS required<br/>Web Bluetooth prerequisite"]
    end

    subgraph Auth["Authentication"]
        OAuth["Google OAuth 2.0 PKCE<br/>No client secret exposed"]
        Scopes["Minimal scopes<br/>• spreadsheets<br/>• drive.file<br/>• openid / email / profile"]
        Token["Access token<br/>• Memory only — not localStorage<br/>• Short-lived · Bearer header"]
    end

    subgraph BLE["Bluetooth Security"]
        Permission["User explicit permission<br/>per device · browser prompt"]
        Local["Device pairing local-only<br/>No network exposure"]
    end

    subgraph Data["Data Security"]
        NoSecrets["No secrets in source code<br/>VITE_GOOGLE_CLIENT_ID is public"]
        UserOwned["Data stored in user's<br/>own Google Drive / Sheets"]
        NoBackend["No backend<br/>no server attack surface"]
    end

    classDef browserSec fill:#1e3a5f,stroke:#3b82f6,color:#e2e8f0
    classDef authSec fill:#2d1b4e,stroke:#8b5cf6,color:#e2e8f0
    classDef bleSec fill:#14402f,stroke:#22c55e,color:#e2e8f0
    classDef dataSec fill:#3d3400,stroke:#eab308,color:#e2e8f0

    class COOP,COEP,HTTPS browserSec
    class OAuth,Scopes,Token authSec
    class Permission,Local bleSec
    class NoSecrets,UserOwned,NoBackend dataSec
```

---

## 12. Deployment Architecture

```mermaid
graph TB
    subgraph Dev["Development"]
        Vite["vite dev server<br/>localhost:5173<br/>HMR + COEP/COOP headers"]
    end

    subgraph Build["Build Pipeline"]
        ViteBuild["vite build → dist/"]
        Assets["dist/<br/>├── index.html<br/>├── assets/<br/>│   ├── index-[hash].js<br/>│   └── index-[hash].css<br/>└── _headers"]
    end

    subgraph Deploy["Deployment Options"]
        CF("Cloudflare Pages<br/>wrangler.jsonc · _headers: COEP/COOP")
        Static("Any static host<br/>requires custom headers")
    end

    subgraph Runtime["Runtime Requirements"]
        Chrome("Chrome / Edge only<br/>Web Bluetooth support")
        HTTPS2("HTTPS required")
        GoogleOAuth("Google OAuth<br/>consent screen")
    end

    Dev --> Build
    Build --> Deploy
    Deploy --> Runtime

    classDef dev fill:#1e3a5f,stroke:#3b82f6,color:#e2e8f0
    classDef build fill:#2d1b4e,stroke:#8b5cf6,color:#e2e8f0
    classDef deploy fill:#14402f,stroke:#22c55e,color:#e2e8f0
    classDef runtime fill:#3d1f00,stroke:#f97316,color:#e2e8f0

    class Vite dev
    class ViteBuild,Assets build
    class CF,Static deploy
    class Chrome,HTTPS2,GoogleOAuth runtime
```

### 12.1 Required HTTP Headers (Production)

The `_headers` file (Cloudflare Pages) and `vite.config.ts` (dev) both configure:

```
Cross-Origin-Opener-Policy: same-origin-allow-popups
Cross-Origin-Embedder-Policy: require-corp
```

These are mandatory — without them, either the OAuth popup is blocked or Web Bluetooth is unavailable.

---

## 13. Key Design Decisions

### 13.1 No Backend Server

**Decision:** All business logic runs client-side; Google APIs are called directly from the browser.

**Rationale:**
- Eliminates infrastructure cost and complexity
- User data goes directly to their own Google Drive — no third-party storage
- OAuth tokens never touch a server
- Acceptable because the only integrations are Google APIs (browser-friendly CORS)

**Trade-offs:**
- Token refresh must happen client-side (no server-side token management)
- No server-side caching — every person switch fetches the full Sheets data

---

### 13.2 Zustand over Redux / Context

**Decision:** Five independent Zustand stores, one per domain.

**Rationale:**
- Zustand is ~2 KB; no reducers, actions, or dispatch boilerplate
- Independent stores prevent cross-domain re-renders
- Easy to subscribe to a single field: `useForceStore(s => s.highestForce)`
- Direct mutation pattern matches the imperative BLE callback style

**Trade-offs:**
- No time-travel debugging (no Redux DevTools)
- No enforced action log

---

### 13.3 Google Sheets as Database

**Decision:** Google Sheets is the sole persistence layer.

**Rationale:**
- Users already have Google accounts
- Zero database setup — sheet is auto-created on first login
- Data is human-readable and exportable by default
- `=UNIQUE(Data!B2:B)` formula handles deduplication automatically

**Trade-offs:**
- API rate limits (reads count against quota)
- No real-time sync — history loads per person switch, not continuously
- All test results loaded into memory for filtering (no server-side query)

---

### 13.4 Service Singletons

**Decision:** `bluetoothService` and `googleSheetsService` are module-level singletons.

**Rationale:**
- BLE and OAuth connections are inherently singleton resources
- Avoids prop-drilling service instances through the component tree
- State derived from services lives in Zustand stores (testable separately)

**Trade-offs:**
- Harder to unit test (global mutable state)
- Cannot have multiple simultaneous BLE connections (not needed)

---

### 13.5 COEP/COOP Header Requirement

**Decision:** Configure both `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy` headers.

**Rationale:**
- `COEP: require-corp` is required to access shared memory APIs and is implicitly needed for Web Bluetooth in some browser configurations
- `COOP: same-origin-allow-popups` allows the Google OAuth popup to communicate back to the opener window
- These two headers together satisfy both BLE and OAuth requirements without relaxing security meaningfully

**Trade-offs:**
- Restricts loading third-party resources without `Cross-Origin-Resource-Policy` headers (not an issue since no external assets are loaded)

---

## 14. Module Dependency Graph

How modules import each other — arrows point from importer to dependency.

```mermaid
graph LR
    subgraph Components["React Components"]
        App
        BluetoothControl
        DeviceSelector
        ForceDisplay
        ForceTest
        PersonSelector
        HistoryChart
        GoogleAuth
        GoogleSheetsStatus
        UserProfile
        DarkModeToggle
        BluetoothStatus
    end

    subgraph Stores["Zustand Stores"]
        authStore
        bluetoothStore
        forceStore
        historyStore
        namesStore
    end

    subgraph Services["Service Layer"]
        BTIndex["bluetooth/index.ts"]
        BTConn["bluetooth/connection.ts"]
        BTReader["bluetooth/force-reader.ts"]
        BTParser["bluetooth/parser.ts"]
        SheetsService["googleSheets.ts"]
    end

    subgraph Utils["Utilities"]
        ForceConverter["forceConversion.ts"]
        BTConstants["constants/bluetooth.ts"]
        useTheme
    end

    BluetoothControl --> BluetoothStatus
    BluetoothControl --> DeviceSelector
    DeviceSelector --> BTIndex
    DeviceSelector --> bluetoothStore
    ForceDisplay --> forceStore
    ForceDisplay --> ForceConverter
    ForceTest --> forceStore
    ForceTest --> SheetsService
    ForceTest --> historyStore
    PersonSelector --> forceStore
    PersonSelector --> authStore
    PersonSelector --> namesStore
    PersonSelector --> historyStore
    PersonSelector --> SheetsService
    HistoryChart --> historyStore
    HistoryChart --> forceStore
    HistoryChart --> useTheme
    HistoryChart --> ForceConverter
    GoogleAuth --> authStore
    GoogleAuth --> SheetsService
    GoogleSheetsStatus --> SheetsService
    DarkModeToggle --> useTheme
    BluetoothStatus --> bluetoothStore

    BTIndex --> BTConn
    BTIndex --> BTReader
    BTIndex --> bluetoothStore
    BTIndex --> forceStore
    BTReader --> BTParser
    BTReader --> BTConstants
    BTConn --> BTConstants

    classDef component fill:#1e3a5f,stroke:#3b82f6,color:#e2e8f0
    classDef store fill:#2d1b4e,stroke:#8b5cf6,color:#e2e8f0
    classDef service fill:#14402f,stroke:#22c55e,color:#e2e8f0
    classDef util fill:#3d3400,stroke:#eab308,color:#e2e8f0

    class App,BluetoothControl,DeviceSelector,ForceDisplay,ForceTest,PersonSelector,HistoryChart,GoogleAuth,GoogleSheetsStatus,UserProfile,DarkModeToggle,BluetoothStatus component
    class authStore,bluetoothStore,forceStore,historyStore,namesStore store
    class BTIndex,BTConn,BTReader,BTParser,SheetsService service
    class ForceConverter,BTConstants,useTheme util
```

---

## 15. Render Optimization Strategy

### 15.1 Why components don't over-render

Each component subscribes to the **minimum slice** of state needed via Zustand selectors. Zustand uses shallow equality by default — a component only re-renders when its subscribed value actually changes.

```mermaid
graph LR
    subgraph ForceStore["forceStore — updates at 100 Hz"]
        readings
        isRecording
        selectedPerson
        highestForce
    end

    ForceDisplay("ForceDisplay") -->|"readings, highestForce, isRecording"| ForceStore
    ForceTest("ForceTest") -->|"highestForce, selectedPerson, isRecording"| ForceStore
    HistoryChart("HistoryChart") -->|"selectedPerson"| ForceStore
    PersonSelector("PersonSelector") -->|"selectedPerson"| ForceStore

    classDef component fill:#1e3a5f,stroke:#3b82f6,color:#e2e8f0
    classDef field fill:#2d1b4e,stroke:#8b5cf6,color:#e2e8f0

    class ForceDisplay,ForceTest,HistoryChart,PersonSelector component
    class readings,isRecording,selectedPerson,highestForce field
```

- `ForceDisplay` uses a single multi-field selector — re-renders on every reading (intentional: displays live data)
- `HistoryChart` subscribes only to `selectedPerson` — unaffected by the 100 Hz reading stream
- `ForceTest` re-renders only when `highestForce` or `selectedPerson` changes

### 15.2 High-frequency data path

At ~100 Hz, `forceStore.addReading()` fires continuously while sampling. Only `ForceDisplay` is subscribed to `readings` — all other components subscribe to derived values (`highestForce`, `selectedPerson`) that change far less frequently.

```
BLE event @ 100Hz
  → forceStore.addReading()          ← Zustand setState
  → ForceDisplay re-render           ← subscribed to readings[]
  → highestForce updated (if new max)
    → ForceTest re-render            ← subscribed to highestForce
```

---

## 16. Error Handling & Resilience

### 16.1 Error state map

```mermaid
flowchart TD
    subgraph BLE["Bluetooth Errors"]
        B1["User denies<br/>device permission"] -->|"requestDevice() throws"| B1R(["Show 'Scan failed'<br/>UI reset to idle"])
        B2["Device out of range"] -->|"gattserverdisconnected event"| B2R(["bluetoothStore.setConnected(false)<br/>User must reconnect"])
        B3["GATT characteristic<br/>not found"] -->|"getCharacteristic() throws"| B3R(["console.error<br/>Connection aborted"])
    end

    subgraph OAuth["Auth Errors"]
        A1["User cancels<br/>OAuth popup"] -->|"onError callback"| A1R(["Stay unauthenticated<br/>No state change"])
        A2["Token expired<br/>during session"] -->|"Sheets API 401"| A2R(["console.error<br/>Operation fails silently"])
    end

    subgraph Sheets["Google Sheets Errors"]
        S1["Sheet not found<br/>on first login"] -->|"checkSpreadsheetExists()=false"| S1R(["Show 'Create Sheet' button"])
        S2["Append fails<br/>quota / network"] -->|"catch in appendTestResult"| S2R(["console.error<br/>No user feedback"])
        S3["getHistory fails"] -->|"catch in getHistoryForPerson"| S3R(["historyStore.history = []<br/>Empty chart shown"])
    end

    classDef error fill:#3d1f00,stroke:#f97316,color:#e2e8f0
    classDef resolution fill:#14402f,stroke:#22c55e,color:#e2e8f0

    class B1,B2,B3,A1,A2,S1,S2,S3 error
    class B1R,B2R,B3R,A1R,A2R,S1R,S2R,S3R resolution
```

### 16.2 Known resilience gaps

| Scenario | Current Behavior | Recommended Improvement |
|----------|-----------------|------------------------|
| Sheets API 401 (expired token) | Silent fail | Prompt re-authentication |
| `appendTestResult` network error | Silent fail | Toast error + retry queue |
| BLE disconnect during recording | Force data stops, no alert | Detect disconnect, warn user |
| No names in sheet yet | Empty dropdown | Show "No people yet — type a new name" |

---

## 17. Force Conversion Math

### 17.1 Raw BLE → display units pipeline

```
DataView (bytes 2–5, little-endian float32)
  = weight in raw sensor units (approximately kg)

Math.round(weight × 22.04) / 10 = force in Newtons
  ↓
  N × 0.101972 = force in kg (body-weight equivalent)
  N × 0.224809 = force in lbs
```

### 17.2 Conversion factor origin

The Tindeq Progressor outputs a float where the unit approximates kilograms of load. The expression `Math.round(weight × 22.04) / 10` multiplies by ~2.204 (kg→lbs factor) and rounds to one decimal place of precision in Newtons. This is specific to the Tindeq protocol and not a standard SI conversion.

The display/persistence conversions use reciprocal multiplication rather than division: `0.101972 ≈ 1/9.80665` and `0.224809 ≈ 1/4.44822`.

```mermaid
graph LR
    Raw("Raw float32<br/>sensor units ≈ kg")
    Raw -->|"Math.round(× 22.04) / 10"| N[("Newtons (N)<br/>master unit in forceStore")]
    N -->|"× 0.101972"| KG("Kilograms (kg)<br/>ForceDisplay + Sheets")
    N -->|"× 0.224809"| LBS("Pounds (lbs)<br/>ForceDisplay + Sheets")
    N -->|"identity"| NN("Newtons (N)<br/>ForceDisplay")

    classDef raw fill:#3d1f00,stroke:#f97316,color:#e2e8f0
    classDef master fill:#2d1b4e,stroke:#8b5cf6,color:#e2e8f0
    classDef display fill:#14402f,stroke:#22c55e,color:#e2e8f0

    class Raw raw
    class N master
    class KG,LBS,NN display
```

All intermediate values are discarded — only Newtons are stored in `forceStore`. Conversions happen at render time in `ForceDisplay` and at save time in `appendTestResult`.

---

## 18. Theme System

```mermaid
flowchart LR
    subgraph useTheme["useTheme Hook"]
        Init["Read localStorage('theme')<br/>or prefers-color-scheme"]
        Toggle["toggle()<br/>→ flip isDark<br/>→ write localStorage<br/>→ set/remove dark class on html"]
    end

    Init --> HTMLClass("html element<br/>class='dark'")
    HTMLClass --> Tailwind("Tailwind dark: variants<br/>activate globally")
    Toggle --> Init
    DarkModeToggle("DarkModeToggle") -->|"calls toggle()"| Toggle

    classDef hook fill:#2d1b4e,stroke:#8b5cf6,color:#e2e8f0
    classDef dom fill:#1a2744,stroke:#60a5fa,color:#e2e8f0
    classDef component fill:#1e3a5f,stroke:#3b82f6,color:#e2e8f0
    classDef framework fill:#3d3400,stroke:#eab308,color:#e2e8f0

    class Init,Toggle hook
    class HTMLClass dom
    class DarkModeToggle component
    class Tailwind framework
```

- Theme is persisted in `localStorage` under key `'theme'`
- Tailwind's `darkMode: 'class'` strategy — all `dark:` variants key off the `<html>` element's class
- `useTheme` is the only custom hook in the codebase; it wraps an internal Zustand store (`useThemeStore`) not exported alongside the five domain stores

---

## 19. Sequence — Tare Operation

The tare operation zeroes the force sensor, compensating for equipment weight (e.g., harness, rope).

```mermaid
sequenceDiagram
    autonumber
    box rgb(30,58,95) Browser
    participant User
    participant ForceTest
    participant BluetoothService
    participant ForceReader
    participant forceStore
    participant ForceDisplay
    end
    box rgb(61,31,0) BLE Device
    participant BLEDevice as Tindeq Progressor
    end

    User->>ForceTest: Click "Tare"
    ForceTest->>BluetoothService: tare()
    BluetoothService->>ForceReader: tare()
    ForceReader->>BLEDevice: controlChar.writeValue(new Uint8Array([0x64]))
    Note over BLEDevice: Device zeros internal load cell
    BLEDevice-->>ForceReader: Subsequent readings relative to new zero
    ForceReader-->>forceStore: addReading({ force: ~0 })
    forceStore-->>ForceDisplay: currentForce ≈ 0 N
```

---

## 20. Sequence — Person History Load

```mermaid
sequenceDiagram
    autonumber
    box rgb(30,58,95) Browser
    participant User
    participant PersonSelector
    participant forceStore
    participant historyStore
    participant SheetsService as GoogleSheetsService
    participant HistoryChart
    end
    box rgb(61,31,0) Google Cloud
    participant SheetsAPI as Google Sheets API
    end

    User->>PersonSelector: Select "Alice" from dropdown
    PersonSelector->>forceStore: setSelectedPerson("Alice")
    PersonSelector->>historyStore: setLoadingHistory(true)
    PersonSelector->>SheetsService: getHistoryForPerson("Alice")
    SheetsService->>SheetsAPI: GET /values/Data!A:F
    SheetsAPI-->>SheetsService: All rows (entire Data sheet)
    Note over SheetsService: Filter rows where col B === "Alice"
    Note over SheetsService: Map to HistoryEntry[], sort by timestamp
    SheetsService-->>historyStore: setHistory(aliceEntries)
    historyStore-->>PersonSelector: isLoadingHistory = false
    historyStore-->>HistoryChart: re-render with Alice's data
```

---

## 21. Environment & Configuration Reference

| Variable | Location | Purpose |
|----------|----------|---------|
| `VITE_GOOGLE_CLIENT_ID` | `.env` | Google OAuth client ID (public, per-project) |
| `COOP` header | `vite.config.ts` + `_headers` | Enables OAuth popup return |
| `COEP` header | `vite.config.ts` + `_headers` | Required for Web Bluetooth + shared memory |
| `wrangler.jsonc` | Project root | Cloudflare Pages deployment config |
| `tailwind.config.js` | Project root | `darkMode: 'class'` strategy |
| `tsconfig.app.json` | Project root | `strict: true`, `target: ES2020` |

---

## 22. Browser Compatibility

| Feature | Chrome | Edge | Firefox | Safari |
|---------|--------|------|---------|--------|
| Web Bluetooth | ✅ | ✅ | ❌ | ❌ |
| Google OAuth popup | ✅ | ✅ | ✅ | ✅ |
| ES2020 modules | ✅ | ✅ | ✅ | ✅ |
| CSS `@layer` (Tailwind) | ✅ | ✅ | ✅ | ✅ |
| **Overall** | **✅ Full** | **✅ Full** | **❌ No BLE** | **❌ No BLE** |

The app is functionally blocked on Firefox and Safari due to their lack of Web Bluetooth API support. A "browser not supported" guard at the `App` level would improve the user experience for those visitors.

---

## 23. Potential Future Architecture

These are not planned changes — they document logical extension points if requirements grow.

### 23.1 Offline / PWA support

```mermaid
graph LR
    SW("Service Worker · Workbox") -->|"cache static assets"| Offline("Offline UI load")
    IDB("IndexedDB · idb-keyval") -->|"buffer readings<br/>when network down"| Queue("Sync queue")
    Queue -->|"flush on reconnect"| SheetsService("GoogleSheetsService")

    classDef future fill:#2d1b4e,stroke:#8b5cf6,color:#e2e8f0
    classDef storage fill:#1a2744,stroke:#60a5fa,color:#e2e8f0
    classDef svc fill:#14402f,stroke:#22c55e,color:#e2e8f0

    class SW,Queue future
    class IDB,Offline storage
    class SheetsService svc
```

### 23.2 Multi-device / multi-user scaling

```mermaid
graph LR
    CloudFn("Cloud Function<br/>optional backend") -->|"token refresh<br/>batch writes"| SheetsAPI("Google Sheets API")
    Supabase("Supabase / PlanetScale<br/>alternative DB") -->|"real-time sync<br/>multi-user"| App("App")
    App -->|"currently direct"| SheetsAPI

    classDef future fill:#2d1b4e,stroke:#8b5cf6,color:#e2e8f0
    classDef external fill:#3d1f00,stroke:#f97316,color:#e2e8f0
    classDef current fill:#1e3a5f,stroke:#3b82f6,color:#e2e8f0

    class CloudFn,Supabase future
    class SheetsAPI external
    class App current
```

### 23.3 BLE reconnection

Currently the app requires manual reconnection if the device drops. An auto-reconnect loop using the cached device reference from `navigator.bluetooth.getDevices()` could be added to `BluetoothConnection` without changing the store or UI contract.

---

*End of Architecture Design Document*
