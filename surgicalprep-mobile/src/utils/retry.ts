// src/utils/retry.ts
// Retry utility with exponential backoff for SurgicalPrep

export interface RetryConfig {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryCondition?: (error: unknown) => boolean;
  onRetry?: (error: unknown, attempt: number) => void;
}

const DEFAULT_CONFIG: Required<Omit<RetryConfig, 'retryCondition' | 'onRetry'>> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};

// HTTP status codes that are typically retryable
const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];

/**
 * Check if an error is retryable based on HTTP status
 */
export const isRetryableError = (error: unknown): boolean => {
  if (error && typeof error === 'object') {
    // Axios-style error
    if ('response' in error && error.response && typeof error.response === 'object') {
      const response = error.response as { status?: number };
      if (response.status && RETRYABLE_STATUS_CODES.includes(response.status)) {
        return true;
      }
    }
    
    // Network error (no response)
    if ('response' in error && error.response === undefined) {
      // Check if it's a network error, not a cancelled request
      if ('code' in error && error.code !== 'ERR_CANCELED') {
        return true;
      }
    }
    
    // Status property directly on error
    if ('status' in error) {
      const status = (error as { status: number }).status;
      if (RETRYABLE_STATUS_CODES.includes(status)) {
        return true;
      }
    }
  }
  
  return false;
};

/**
 * Calculate delay for next retry using exponential backoff with jitter
 */
export const calculateDelay = (
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  multiplier: number
): number => {
  // Exponential backoff
  const exponentialDelay = initialDelay * Math.pow(multiplier, attempt - 1);
  
  // Cap at max delay
  const cappedDelay = Math.min(exponentialDelay, maxDelay);
  
  // Add jitter (±25% randomization)
  const jitter = cappedDelay * 0.25 * (Math.random() * 2 - 1);
  
  return Math.round(cappedDelay + jitter);
};

/**
 * Sleep for a specified duration
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Execute a function with retry logic
 * @param fn - The async function to execute
 * @param config - Retry configuration
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const {
    maxRetries = DEFAULT_CONFIG.maxRetries,
    initialDelay = DEFAULT_CONFIG.initialDelay,
    maxDelay = DEFAULT_CONFIG.maxDelay,
    backoffMultiplier = DEFAULT_CONFIG.backoffMultiplier,
    retryCondition = isRetryableError,
    onRetry,
  } = config;

  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Check if we've exhausted retries
      if (attempt > maxRetries) {
        break;
      }
      
      // Check if error is retryable
      if (!retryCondition(error)) {
        break;
      }
      
      // Calculate delay for next attempt
      const delay = calculateDelay(attempt, initialDelay, maxDelay, backoffMultiplier);
      
      // Call onRetry callback
      onRetry?.(error, attempt);
      
      // Log in development
      if (__DEV__) {
        console.log(`[Retry] Attempt ${attempt} failed, retrying in ${delay}ms...`);
      }
      
      // Wait before retrying
      await sleep(delay);
    }
  }
  
  // All retries exhausted, throw the last error
  throw lastError;
}

/**
 * Create a retryable version of a function
 * @param fn - The function to make retryable
 * @param config - Retry configuration
 */
export function createRetryable<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  config: RetryConfig = {}
): (...args: TArgs) => Promise<TReturn> {
  return (...args: TArgs) => withRetry(() => fn(...args), config);
}

/**
 * Retry decorator for class methods
 */
export function Retryable(config: RetryConfig = {}) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: unknown[]) {
      return withRetry(() => originalMethod.apply(this, args), config);
    };
    
    return descriptor;
  };
}

/**
 * Queue for managing retryable operations
 */
export class RetryQueue {
  private queue: Array<{
    fn: () => Promise<unknown>;
    config: RetryConfig;
    resolve: (value: unknown) => void;
    reject: (error: unknown) => void;
  }> = [];
  private processing = false;
  private concurrency: number;
  private activeCount = 0;

  constructor(concurrency = 1) {
    this.concurrency = concurrency;
  }

  /**
   * Add an operation to the queue
   */
  async add<T>(fn: () => Promise<T>, config: RetryConfig = {}): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        fn,
        config,
        resolve: resolve as (value: unknown) => void,
        reject,
      });
      this.process();
    });
  }

  /**
   * Process the queue
   */
  private async process(): Promise<void> {
    if (this.activeCount >= this.concurrency || this.queue.length === 0) {
      return;
    }

    this.activeCount++;
    const item = this.queue.shift()!;

    try {
      const result = await withRetry(item.fn, item.config);
      item.resolve(result);
    } catch (error) {
      item.reject(error);
    } finally {
      this.activeCount--;
      this.process();
    }
  }

  /**
   * Clear the queue
   */
  clear(): void {
    this.queue.forEach((item) => {
      item.reject(new Error('Queue cleared'));
    });
    this.queue = [];
  }

  /**
   * Get the current queue length
   */
  get length(): number {
    return this.queue.length;
  }
}

export default {
  withRetry,
  createRetryable,
  isRetryableError,
  calculateDelay,
  RetryQueue,
  Retryable,
};
