import { format } from 'date-fns';
import { convertForce } from '../utils/forceConversion';

export interface SheetEntry {
  timestamp: number;
  force: number;
  name?: string;
}

class GoogleSheetsService {
  private accessToken: string | null = null;
  private readonly SHEET_NAME = 'Tindeq Force Logs';
  private readonly NAMES_SHEET = 'Menu!A:A';
  private readonly DATA_SHEET = 'Data!A:F';
  private spreadsheetId: string | null = null;

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  async checkSpreadsheetExists(): Promise<boolean> {
    if (!this.accessToken) {
      throw new Error('Not authenticated with Google');
    }

    try {
      const existingId = await this.findSpreadsheet();
      return !!existingId;
    } catch (error) {
      console.error('Failed to check spreadsheet:', error);
      return false;
    }
  }

  private async findSpreadsheet(): Promise<string | null> {
    if (!this.accessToken) {
      throw new Error('Not authenticated with Google');
    }

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${this.SHEET_NAME}' and mimeType='application/vnd.google-apps.spreadsheet'`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      }
    );

    const data = await response.json();
    return data.files?.[0]?.id || null;
  }

  async createSpreadsheet(): Promise<string> {
    if (!this.accessToken) {
      throw new Error('Not authenticated with Google');
    }

    const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          title: this.SHEET_NAME,
        },
        sheets: [
          {
            properties: {
              title: 'Menu',
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
        ],
      }),
    });

    const data = await response.json();
    this.spreadsheetId = data.spreadsheetId;
    await this.initializeSheets(data.spreadsheetId);
    return data.spreadsheetId;
  }

  private async initializeSheets(spreadsheetId: string): Promise<void> {
    const headers = {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };

    // Initialize Data sheet headers with additional columns for pounds and kilograms
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Data!A1:F1?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          values: [['Timestamp', 'Name', 'Force (N)', 'Force (lbs)', 'Force (kg)', 'Notes']],
        }),
      }
    );

    // Initialize Menu sheet header
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Menu!A1:A1?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          values: [['Names']],
        }),
      }
    );
  }

  async getNames(): Promise<string[]> {
    if (!this.accessToken) {
      throw new Error('Not authenticated with Google');
    }

    try {
      const spreadsheetId = await this.findSpreadsheet();
      if (!spreadsheetId) {
        return [];
      }

      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${this.NAMES_SHEET}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );
      
      const data = await response.json();
      if (!data.values || data.values.length <= 1) {
        return [];
      }
      
      return data.values
        .slice(1)
        .map((row: string[]) => row[0])
        .filter(Boolean);
    } catch (error) {
      console.error('Failed to fetch names:', error);
      return [];
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

      const body = {
        values,
        majorDimension: 'ROWS'
      };

      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${this.DATA_SHEET}:append?valueInputOption=USER_ENTERED`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        }
      );
    } catch (error) {
      console.error('Failed to append test result:', error);
      throw error;
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();