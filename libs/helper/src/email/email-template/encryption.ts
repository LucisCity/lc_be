export function encode(data: string): string {
  if (!data || data.length == 0) return '';
  const array: string[] = data.split('');
  const step = Number(process.env.VERIFY_INDEX);
  const number: number[] = array.map((item) => {
    return item.charCodeAt(0) + step;
  });
  let result = '';
  number.forEach((item) => {
    if (result.length === 0) {
      result += item.toString();
    } else {
      result += ',' + item.toString();
    }
  });
  return result;
}

export function decode(data: string): string {
  if (!data || data.length == 0) return '';
  const step = Number(process.env.VERIFY_INDEX);
  const array: string[] = data.split(',');
  const number: number[] = array.map((item) => {
    return Number(item) - step;
  });
  let result = '';
  number.forEach((item) => {
    result += String.fromCharCode(item);
  });
  return result;
}
