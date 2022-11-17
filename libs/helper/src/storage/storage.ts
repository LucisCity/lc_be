import * as fs from 'fs';

let result: { [key: string]: any } = {};

function getConfig(key: string): any {
  const configData = fs.readFileSync('config.json');
  result = JSON.parse(configData.toString());
  return result[key];
}

function saveConfig(key: string, value: string) {
  result[key] = value;
  const data = JSON.stringify(result);
  fs.writeFileSync('config.json', data);
}

export const StorageHelper = {
  get: getConfig,
  set: saveConfig,
};
