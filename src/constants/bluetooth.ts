// Tindeq Progressor BLE Service and Characteristic UUIDs
export const TINDEQ_SERVICE_UUID = '7e4e1701-1ea6-40c9-9dcc-13d34ffead57';
export const TINDEQ_CHARACTERISTIC_UUID = '7e4e1702-1ea6-40c9-9dcc-13d34ffead57';
export const TINDEQ_CONTROL_CHARACTERISTIC_UUID = '7e4e1703-1ea6-40c9-9dcc-13d34ffead57';

export const COMMAND = {
  START_SAMPLING: new Uint8Array([0x65]),
  STOP_SAMPLING: new Uint8Array([0x66]),
  TARE: new Uint8Array([0x64]),
};