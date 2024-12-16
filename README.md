# Tindeq Force Logger

A web application for logging and tracking force measurements from Tindeq Progressor devices. This application connects to Tindeq Progressor dynamometers via Bluetooth, records force measurements, and stores the data in Google Sheets for easy analysis and tracking.

![Tindeq Force Logger](https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=2069)

## Features

- 🔵 Bluetooth connection to Tindeq Progressor devices
- 📊 Real-time force measurements display
- 📝 Automatic force plateau detection
- 📈 Google Sheets integration for data logging
- 👥 Multi-user support with name management
- 📱 Mobile-friendly responsive design

## Technology Stack

- **Frontend Framework**: React with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Authentication**: Google OAuth
- **APIs**:
  - Web Bluetooth API
  - Google Sheets API
- **Build Tool**: Vite

## Prerequisites

Before running the application, ensure you have:

1. Node.js (v18 or higher)
2. A modern web browser that supports Web Bluetooth API (Chrome recommended)
3. A Google Cloud Project with:
   - Google Sheets API enabled
   - OAuth 2.0 credentials configured

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/tindeq-force-logger.git
   cd tindeq-force-logger
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```env
   VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Usage

1. **Connect Device**:
   - Click "Find Tindeq Device"
   - Select your Tindeq Progressor from the list
   - Wait for connection confirmation

2. **Google Authentication**:
   - Sign in with your Google account
   - Grant necessary permissions
   - The app will create a spreadsheet named "Tindeq Force Logger"

3. **Record Measurements**:
   - Select a person from the dropdown
   - Click "Start Test"
   - Apply force to the device
   - The test will automatically stop when a plateau is detected

4. **View Data**:
   - All measurements are automatically saved to Google Sheets
   - Access your data in the "Tindeq Force Logger" spreadsheet

## Project Structure

```
src/
├── components/           # React components
│   ├── bluetooth/       # Bluetooth-related components
│   └── ui/             # Reusable UI components
├── services/            # External service integrations
├── store/              # Zustand state management
├── utils/              # Utility functions
└── constants/          # Application constants
```

## Development

### Key Files

- `src/services/bluetooth.ts`: Handles Bluetooth device communication
- `src/services/googleSheets.ts`: Manages Google Sheets integration
- `src/utils/forceCalculation.ts`: Force measurement calculations
- `src/store/*.ts`: State management stores

### Testing Locally

1. Start the development server:
   ```bash
   npm run dev
   ```

2. For Bluetooth functionality:
   - Use Chrome or Edge browser
   - Enable Web Bluetooth API
   - Have a Tindeq Progressor device nearby

3. For Google Sheets:
   - Ensure you have proper OAuth credentials
   - Test with a development Google account

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Tindeq for their Progressor device and API documentation
- Google for their Sheets API
- The Web Bluetooth community

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.