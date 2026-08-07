import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ManyToMany } from 'typeorm/browser';
import { LogAnalysisJob } from './log-analysis-job.entity';

export enum AnomalyStatus {}

export enum AnomalySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity()
export class Anomaly {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'simple-json', nullable: true })
  ticketInfo?: Record<string, any>;

  @Column()
  severity: AnomalySeverity;

  @ManyToMany(() => LogAnalysisJob, (job) => job.anomalies, {
    onDelete: 'CASCADE',
  })
  logAnalysisJob: LogAnalysisJob;
}
