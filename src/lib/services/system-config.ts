import {dbService} from '@/lib/db/service';
import {SystemConfig, SystemConfigKey, SystemMappedConfig} from '@/lib/types/models/system-config';

class SystemConfigService {
  // Cache to store config values
  private cache: SystemMappedConfig = {};
  private cacheEnabled: boolean = true;

  /**
   * Clear the entire cache
   */
  clearCache(): void {
    this.cache = {};
  }

  /**
   * Enable or disable the cache
   * @param enabled - Whether the cache should be enabled
   */
  setCacheEnabled(enabled: boolean): void {
    this.cacheEnabled = enabled;
  }

  /**
   * Remove a specific key from the cache
   * @param key - The key to remove from cache
   */
  clearCacheKey(key: SystemConfigKey): void {
    delete this.cache[key];
  }
  /**
   * Get a config value by key
   * @param key - The config key
   * @param defaultValue - Optional default value to return if the key doesn't exist
   * @param skipCache - Whether to skip the cache and force a database read
   * @returns The parsed config value or the default value if not found
   */
  async get<T = any>(key: SystemConfigKey, defaultValue?: T, skipCache: boolean = false): Promise<T | undefined> {
    // Check cache first if enabled and not explicitly skipped
    if (this.cacheEnabled && !skipCache && key in this.cache) {
      return this.cache[key] as T;
    }

    // If not in cache or cache is disabled, get from database
    const config = await dbService.systemConfig.findOne({key});
    if (!config) {
      // Store default value in cache if provided
      if (defaultValue !== undefined && this.cacheEnabled) {
        this.cache[key] = defaultValue;
      }
      return defaultValue !== undefined ? defaultValue : undefined;
    }

    let parsedValue: any;
    try {
      parsedValue = JSON.parse(config.value);
    } catch (error) {
      // If parsing fails, use the raw value
      parsedValue = config.value;
    }

    // Update cache if enabled
    if (this.cacheEnabled) {
      this.cache[key] = parsedValue;
    }

    return parsedValue as T;
  }

  /**
   * Set a config value
   * @param key - The config key
   * @param value - The value to store (will be JSON stringified)
   * @returns The updated config
   */
  async set<T = any>(key: SystemConfigKey, value: T): Promise<SystemConfig> {
    const stringValue = JSON.stringify(value);

    // Update cache if enabled
    if (this.cacheEnabled) {
      this.cache[key] = value;
    }

    // Try to find existing config
    const existingConfig = await dbService.systemConfig.findOne({key});

    if (existingConfig) {
      // Update existing config
      const result = await dbService.systemConfig.findOneAndUpdate(
        {key},
        {value: stringValue},
        {new: true}
      );
      if (!result) {
        // Remove from cache if update failed
        if (this.cacheEnabled) {
          delete this.cache[key];
        }
        throw new Error('Failed to update config');
      }
      return result;
    } else {
      // Create new config
      try {
        return await dbService.systemConfig.create({
          key,
          value: stringValue,
        });
      } catch (error) {
        // Remove from cache if creation failed
        if (this.cacheEnabled) {
          delete this.cache[key];
        }
        throw error;
      }
    }
  }

  /**
   * Delete a config by key
   * @param key - The config key to delete
   * @returns True if deleted, false if not found
   */
  async delete(key: SystemConfigKey): Promise<boolean> {
    // Remove from cache if enabled
    if (this.cacheEnabled) {
      delete this.cache[key];
    }

    const result = await dbService.systemConfig.deleteOne({key});
    return result.deletedCount > 0;
  }

  /**
   * Get multiple config values by keys
   * @param keys - Array of config keys
   * @param defaults - Optional object with default values for keys that don't exist
   * @param skipCache - Whether to skip the cache and force a database read
   * @returns Object with key-value pairs of configs
   */
  async getMultiple(keys: SystemConfigKey[], defaults?: Partial<SystemMappedConfig>, skipCache: boolean = false): Promise<SystemMappedConfig> {
    const result: SystemMappedConfig = {};
    const keysToFetch: SystemConfigKey[] = [];

    // First apply defaults if provided
    if (defaults) {
      Object.assign(result, defaults);
    }

    // Check cache first for each key if enabled and not skipped
    if (this.cacheEnabled && !skipCache) {
      for (const key of keys) {
        if (key in this.cache) {
          result[key] = this.cache[key];
        } else {
          keysToFetch.push(key);
        }
      }
    } else {
      // If cache is disabled or skipped, fetch all keys
      keysToFetch.push(...keys);
    }

    // If all keys were in cache, return early
    if (keysToFetch.length === 0) {
      return result;
    }

    // Fetch remaining keys from database
    const configs = await dbService.systemConfig.find({
      key: {$in: keysToFetch}
    });

    // Process database results
    for (const config of configs) {
      let parsedValue: any;
      try {
        parsedValue = JSON.parse(config.value);
      } catch (error) {
        parsedValue = config.value;
      }

      // Update result
      result[config.key] = parsedValue;

      // Update cache if enabled
      if (this.cacheEnabled) {
        this.cache[config.key] = parsedValue;
      }
    }

    return result;
  }

  /**
   * Set multiple config values at once
   * @param configs - Object with key-value pairs to set
   * @returns Number of configs updated/created
   */
  async setMultiple(configs: SystemMappedConfig): Promise<number> {
    const operations = [];

    // Update cache first if enabled
    if (this.cacheEnabled) {
      for (const [key, value] of Object.entries(configs)) {
        this.cache[key as SystemConfigKey] = value;
      }
    }

    // Prepare database operations
    for (const [key, value] of Object.entries(configs)) {
      const stringValue = JSON.stringify(value);

      operations.push({
        updateOne: {
          filter: {key},
          update: {$set: {value: stringValue}},
          upsert: true
        }
      });
    }

    if (operations.length === 0) return 0;

    try {
      const result = await dbService.systemConfig.bulkWrite(operations);
      return (result.upsertedCount || 0) + (result.modifiedCount || 0);
    } catch (error) {
      // If database operation fails, remove the affected keys from cache
      if (this.cacheEnabled) {
        for (const key of Object.keys(configs)) {
          delete this.cache[key as SystemConfigKey];
        }
      }
      throw error;
    }
  }

  /**
   * Get all config values
   * @param defaults - Optional object with default values
   * @param skipCache - Whether to skip the cache and force a database read
   * @returns Object with all config key-value pairs
   */
  async getAll(defaults?: Partial<SystemMappedConfig>, skipCache: boolean = false): Promise<SystemMappedConfig> {
    const result: SystemMappedConfig = {};

    // First apply defaults if provided
    if (defaults) {
      Object.assign(result, defaults);
    }

    // If cache is enabled and not skipped, use it as the source of truth
    if (this.cacheEnabled && !skipCache && Object.keys(this.cache).length > 0) {
      // Copy all cached values
      Object.assign(result, this.cache);
      return result;
    }

    // Otherwise, get all configs from database
    const configs = await dbService.systemConfig.find({});

    // Process database results
    for (const config of configs) {
      let parsedValue: any;
      try {
        parsedValue = JSON.parse(config.value);
      } catch (error) {
        parsedValue = config.value;
      }

      // Update result
      result[config.key] = parsedValue;

      // Update cache if enabled
      if (this.cacheEnabled) {
        this.cache[config.key] = parsedValue;
      }
    }

    return result;
  }
}

export const systemConfigService = new SystemConfigService();
