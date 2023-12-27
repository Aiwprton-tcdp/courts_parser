
const iconv = require('iconv-lite');

export const EncodeString = (text: string, coding: string = 'win1251'): string => {
  const encodedPart = iconv.encode(text, coding);
  const encoded = urlEncodeBytes(encodedPart);
  return encoded;
}

export const EncodeStringSplit = (text: string, delimiter: string = '+', coding: string = 'win1251'): string => {
  const words = text.split(' ');
  const result = words.map(w => EncodeString(w, coding));
  return result.join(delimiter);
}


const urlEncodeBytes = (buf: Buffer): string => {
  let encoded = '';
  const len = buf.length;

  for (let i = 0; i < len; i++) {
    const charBuf = Buffer.from('00', 'hex');
    charBuf.writeUInt8(buf[i]);
    const char = charBuf.toString();
    encoded += isUrlSafe(char)
      ? char
      : `%${charBuf.toString('hex').toUpperCase()}`;
  }

  return encoded;
}

const isUrlSafe = (char: string): boolean => {
  return /[a-zA-Z0-9\-_~.]+/.test(char)
}
