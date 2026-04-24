import { COMMAND } from '../../constants/bluetooth';
import { DeviceCommand, CommandState } from './types';
import { useDeviceCommandStore } from '../../store/deviceCommandStore';

export class CommandManager {
  private state: CommandState = {
    current: 'IDLE',
    lastUpdated: Date.now()
  };

  getCurrentCommand(): DeviceCommand {
    return this.state.current;
  }

  setCommand(command: DeviceCommand) {
    this.state = {
      current: command,
      lastUpdated: Date.now()
    };
    // Update global command state
    useDeviceCommandStore.getState().setCurrentCommand(command);
  }

  isIdle(): boolean {
    return this.state.current === 'IDLE';
  }

  isSampling(): boolean {
    return this.state.current === 'SAMPLING';
  }

  isTesting(): boolean {
    return this.state.current === 'TESTING';
  }

  getCommandData(command: DeviceCommand): Uint8Array {
    switch (command) {
      case 'SAMPLING':
        return COMMAND.START_SAMPLING;
      case 'IDLE':
        return COMMAND.STOP_SAMPLING;
      default:
        throw new Error(`Invalid command: ${command}`);
    }
  }
}