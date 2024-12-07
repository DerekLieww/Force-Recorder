import { format } from 'date-fns';
import { convertForce } from '../utils/forceConversion';

const SPREADSHEET_NAME = 'Tindeq Force Logger';
const OVERVIEW_SHEET = 'Overview!A:A';
const DATA_SHEET = 'Data!A:F';

interface SheetStructure {
  properties: {
    title: string;
    gridProperties: {
      columnCount: number;
      rowCount: number;
    };
  };
}

class GoogleSheetsService {
  private accessToken: string | null = null;
  private spreadsheetId: string | null = null;

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  private async makeRequest(url: string, options: RequestInit = {}) {
    const headers = {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'omit',
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`);
    }

    return response.json();
  }

  private async findSpreadsheet(): Promise<string | null> {
    if (!this.accessToken) {
      throw new Error('Not authenticated with Google');
    }

    const data = await this.makeRequest(
      `https://www.googleapis.com/drive/v3/files?q=name='${SPREADSHEET_NAME}' and mimeType='application/vnd.google-apps.spreadsheet'`
    );

    return data.files?.[0]?.id || null;
  }

  async checkSpreadsheetExists(): Promise<boolean> {
    if (!this.accessToken) {
      throw new Error('Not authenticated with Google');
    }

    try {
      const existingId = await this.findSpreadsheet();
      if (existingId) {
        this.spreadsheetId = existingId;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to check spreadsheet:', error);
      throw error;
    }
  }

  private getSheetStructures(): SheetStructure[] {
    return [
      {
        properties: {
          title: 'Overview',
          gridProperties: {
            columnCount: 1,
            rowCount: 1000,
          },
        },
      },
      {
        properties: {
          title: 'Data',
          gridProperties: {
            columnCount: 6,
            rowCount: 1000,
          },
        },
      },
    ];
  }

  async createSpreadsheet(): Promise<void> {
    if (!this.accessToken) {
      throw new Error('Not authenticated with Google');
    }

    const data = await this.makeRequest(
      'https://sheets.googleapis.com/v4/spreadsheets',
      {
        method: 'POST',
        body: JSON.stringify({
          properties: {
            title: SPREADSHEET_NAME,
          },
          sheets: this.getSheetStructures(),
        }),
      }
    );

    this.spreadsheetId = data.spreadsheetId;
    await this.initializeSheets();
  }

  private async initializeSheets(): Promise<void> {
    if (!this.spreadsheetId) throw new Error('Spreadsheet ID not set');

    // Initialize Data sheet headers
    await this.makeRequest(
      `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/Data!A1:F1?valueInputOption=RAW`,
      {
        method: 'PUT',
        body: JSON.stringify({
          values: [['Timestamp', 'Name', 'Force (N)', 'Force (lbs)', 'Force (kg)', 'Notes']],
        }),
      }
    );

    // Initialize Overview sheet with query formula
    await this.makeRequest(
      `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/Overview!A1:A2?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        body: JSON.stringify({
          values: [
            ['Names'],
            ['=UNIQUE(Data!B2:B)']
          ],
        }),
      }
    );
  }

  async getNames(): Promise<string[]> {
    if (!this.accessToken) {
      return [];
    }

    try {
      const spreadsheetId = await this.findSpreadsheet();
      if (!spreadsheetId) {
        return [];
      }

      const data = await this.makeRequest(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${OVERVIEW_SHEET}`
      );
      
      if (!data.values || data.values.length <= 1) {
        return [];
      }
      
      return data.values
        .slice(1)
        .map((row: string[]) => row[0])
        .filter(Boolean);
    } catch (error) {
      console.error('Failed to fetch names:', error);
      throw error;
    }
  }

  async appendTestResult(name: string, force: number, timestamp: number): Promise<void> {
    if (!this.accessToken) {
      throw new Error('Not authenticated with Google');
    }

    try {
      const spreadsheetId = await this.findSpreadsheet();
      if (!spreadsheetId) {
        throw new Error('Spreadsheet not found');
      }

      const formattedTimestamp = format(timestamp, 'yyyy-MM-dd HH:mm:ss');
      const forceUnits = convertForce(force);
      
      const values = [[
        formattedTimestamp,
        name,
        force.toFixed(2),
        forceUnits.pounds.toFixed(2),
        forceUnits.kilograms.toFixed(2),
        ''  // Empty notes column
      ]];

      await this.makeRequest(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${DATA_SHEET}:append?valueInputOption=USER_ENTERED`,
        {
          method: 'POST',
          body: JSON.stringify({
            values,
            majorDimension: 'ROWS'
          })
        }
      );
    } catch (error) {
      console.error('Failed to append test result:', error);
      throw error;
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();