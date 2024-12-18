export function parseTindeqData(dataView: DataView): number {
  // Tindeq sends 4 bytes of data
  // First byte: Status
  // Next 3 bytes: 24-bit ADC value
  const status = dataView.getUint8(0);
  
  // Check if status byte indicates valid data
  if (status) {
    console.log("status:",status);
  }
  const weight = dataView.getFloat32(2, true);
  let num = Math.round(weight * 22.04) / 10;
  if (num < 0) {
    num = 0;
  }

  // Combine 3 bytes into 24-bit integer
  // const raw = (dataView.getUint8(1) << 16) |
  //             (dataView.getUint8(2) << 8) |
  //             dataView.getUint8(3);
              
  return num;
}

