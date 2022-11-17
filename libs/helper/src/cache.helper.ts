interface CacheInfo<T> {
  start: Date;
  key: string;
  value: T;
}
export class MemoryCache {
  private _cache: Map<string, CacheInfo<any>>;

  // expireTime in milisecond
  constructor(private expireTime: number) {}

  getValue<T>(key: string): T {
    const result: CacheInfo<T> = this._cache.get(key);
    if (this.isExpired(result)) {
      return null;
    }
    return result.value;
  }
  setValue(key: string, value: any) {
    const _value: CacheInfo<any> = {
      start: new Date(),
      key,
      value,
    };
    return this._cache.set(key, _value);
  }
  isExpired(value: CacheInfo<any>) {
    const current = new Date();
    if (current.getTime() - value.start.getTime() > this.expireTime) {
      this._cache.set(value.key, null);
      return true;
    }
    return false;
  }
}
