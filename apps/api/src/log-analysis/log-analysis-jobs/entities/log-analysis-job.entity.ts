import { LogSource } from '@/log-sources/entities/log-source.entity';
import { RemoteServer } from '@/remote-servers/entities/remote-server.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum LogAnalysisJobStatus {
  INITIALIZED = 'initialized',
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum LogAnalysisJobType {
  ONETIME = 'one_time',
  RECURRING = 'recurring',
}

@Entity()
export class LogAnalysisJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ownerId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  status: LogAnalysisJobStatus;

  @Column()
  type: LogAnalysisJobType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => LogSource, { nullable: false })
  @JoinColumn()
  logSource: LogSource;

  @ManyToOne(() => RemoteServer, { nullable: false })
  @JoinColumn()
  remoteServer: RemoteServer;
}
