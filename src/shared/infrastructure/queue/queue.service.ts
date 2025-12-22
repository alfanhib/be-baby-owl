import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, Worker, Job, QueueEvents } from 'bullmq';

export interface EmailJobData {
  to: string;
  subject: string;
  template: string;
  data: Record<string, unknown>;
}

export interface NotificationJobData {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

export interface AnalyticsJobData {
  event: string;
  userId?: string;
  data: Record<string, unknown>;
}

export type QueueName = 'email' | 'notification' | 'analytics';

@Injectable()
export class QueueService implements OnModuleInit {
  private readonly logger = new Logger(QueueService.name);
  private readonly queues: Map<QueueName, Queue> = new Map();
  private readonly workers: Map<QueueName, Worker> = new Map();
  private readonly queueEvents: Map<QueueName, QueueEvents> = new Map();

  private readonly connection: {
    host: string;
    port: number;
    password?: string;
  };

  constructor(private readonly configService: ConfigService) {
    this.connection = {
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD') || undefined,
    };
  }

  onModuleInit(): void {
    // Initialize queues
    this.initQueue('email');
    this.initQueue('notification');
    this.initQueue('analytics');

    this.logger.log('Queue service initialized');
  }

  private initQueue(name: QueueName): void {
    const queue = new Queue(name, { connection: this.connection });
    this.queues.set(name, queue);

    const queueEvents = new QueueEvents(name, { connection: this.connection });
    this.queueEvents.set(name, queueEvents);

    // Listen to events
    queueEvents.on('completed', ({ jobId }) => {
      this.logger.debug(`Job ${jobId} completed on queue ${name}`);
    });

    queueEvents.on('failed', ({ jobId, failedReason }) => {
      this.logger.error(`Job ${jobId} failed on queue ${name}: ${failedReason}`);
    });
  }

  /**
   * Get a queue by name
   */
  getQueue(name: QueueName): Queue {
    const queue = this.queues.get(name);
    if (!queue) {
      throw new Error(`Queue ${name} not initialized`);
    }
    return queue;
  }

  /**
   * Add a job to the email queue
   */
  async addEmailJob(data: EmailJobData, options?: { delay?: number; priority?: number }): Promise<Job<EmailJobData>> {
    const queue = this.getQueue('email');
    const job = await queue.add('send-email', data, {
      delay: options?.delay,
      priority: options?.priority,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
    return job as Job<EmailJobData>;
  }

  /**
   * Add a job to the notification queue
   */
  async addNotificationJob(
    data: NotificationJobData,
    options?: { delay?: number },
  ): Promise<Job<NotificationJobData>> {
    const queue = this.getQueue('notification');
    const job = await queue.add('send-notification', data, {
      delay: options?.delay,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 500,
      },
    });
    return job as Job<NotificationJobData>;
  }

  /**
   * Add a job to the analytics queue
   */
  async addAnalyticsJob(data: AnalyticsJobData): Promise<Job<AnalyticsJobData>> {
    const queue = this.getQueue('analytics');
    const job = await queue.add('track-event', data, {
      attempts: 2,
      removeOnComplete: true,
      removeOnFail: 50,
    });
    return job as Job<AnalyticsJobData>;
  }

  /**
   * Register a worker for a queue
   */
  registerWorker<T>(
    name: QueueName,
    processor: (job: Job<T>) => Promise<void>,
    concurrency: number = 1,
  ): Worker<T> {
    const worker = new Worker<T>(name, processor, {
      connection: this.connection,
      concurrency,
    });

    worker.on('completed', (job) => {
      this.logger.debug(`[${name}] Job ${job.id} completed`);
    });

    worker.on('failed', (job, err) => {
      this.logger.error(`[${name}] Job ${job?.id} failed: ${err.message}`);
    });

    this.workers.set(name, worker as Worker);
    return worker;
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(name: QueueName): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    const queue = this.getQueue(name);
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    return { waiting, active, completed, failed, delayed };
  }

  /**
   * Pause a queue
   */
  async pauseQueue(name: QueueName): Promise<void> {
    const queue = this.getQueue(name);
    await queue.pause();
    this.logger.log(`Queue ${name} paused`);
  }

  /**
   * Resume a queue
   */
  async resumeQueue(name: QueueName): Promise<void> {
    const queue = this.getQueue(name);
    await queue.resume();
    this.logger.log(`Queue ${name} resumed`);
  }

  /**
   * Clean old jobs
   */
  async cleanQueue(
    name: QueueName,
    grace: number = 3600000, // 1 hour
    status: 'completed' | 'failed' = 'completed',
  ): Promise<void> {
    const queue = this.getQueue(name);
    await queue.clean(grace, 100, status);
    this.logger.log(`Queue ${name} cleaned`);
  }

  /**
   * Shutdown all queues and workers gracefully
   */
  async shutdown(): Promise<void> {
    for (const worker of this.workers.values()) {
      await worker.close();
    }

    for (const queueEvents of this.queueEvents.values()) {
      await queueEvents.close();
    }

    for (const queue of this.queues.values()) {
      await queue.close();
    }

    this.logger.log('Queue service shutdown complete');
  }
}

