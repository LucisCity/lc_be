import { Mutex, MutexInterface } from 'async-mutex';

export class MutexService {
  private readonly mutex = new Map<string, Mutex>();

  async lock(key: string): Promise<MutexInterface.Releaser> {
    const _mutex = this.mutex.get(key) ?? new Mutex();
    this.mutex.set(key, _mutex);
    return _mutex.acquire();
  }
}
