type Factory<T> = () => T;

class ServiceLocator {
  private readonly registry = new Map<string, unknown>();
  private readonly factories = new Map<string, Factory<unknown>>();

  registerLazySingleton<T>(key: string, factory: Factory<T>): void {
    this.factories.set(key, factory as Factory<unknown>);
  }

  registerSingleton<T>(key: string, instance: T): void {
    this.registry.set(key, instance);
  }

  get<T>(key: string): T {
    if (this.registry.has(key)) {
      return this.registry.get(key) as T;
    }

    const factory = this.factories.get(key);
    if (!factory) {
      throw new Error(`[ServiceLocator] Dependency not found: ${key}`);
    }

    const instance = factory();
    this.registry.set(key, instance);
    this.factories.delete(key);
    return instance as T;
  }

  reset(): void {
    this.registry.clear();
    this.factories.clear();
  }
}

export const sl = new ServiceLocator();
