export class BluetoothError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'BluetoothError';
  }
}

export class DeviceNotFoundError extends BluetoothError {
  constructor(message = 'Tindeq device not found') {
    super(message);
    this.name = 'DeviceNotFoundError';
  }
}

export class ConnectionError extends BluetoothError {
  constructor(message = 'Failed to connect to device', cause?: unknown) {
    super(message, cause);
    this.name = 'ConnectionError';
  }
}

export class CharacteristicError extends BluetoothError {
  constructor(message = 'Failed to access device characteristics', cause?: unknown) {
    super(message, cause);
    this.name = 'CharacteristicError';
  }
}