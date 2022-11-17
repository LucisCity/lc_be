import { StorageHelper } from './storage';

describe('Storage', function () {
  it('GET and SET success', function () {
    let result = StorageHelper.get('iv');
    console.log('result1: ', result);
    StorageHelper.set('iv', 'akakak');
    result = StorageHelper.get('iv');
    console.log('result2: ', result);
  });
});
