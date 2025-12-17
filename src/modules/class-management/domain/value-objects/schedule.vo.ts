import { ValueObject } from '@shared/domain/value-object.base';

export enum DayOfWeek {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday',
}

interface ScheduleProps {
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  timezone: string;
}

export class Schedule extends ValueObject<ScheduleProps> {
  private constructor(props: ScheduleProps) {
    super(props);
  }

  get dayOfWeek(): DayOfWeek {
    return this.props.dayOfWeek;
  }

  get startTime(): string {
    return this.props.startTime;
  }

  get endTime(): string {
    return this.props.endTime;
  }

  get timezone(): string {
    return this.props.timezone;
  }

  get durationMinutes(): number {
    const [startHour, startMin] = this.props.startTime.split(':').map(Number);
    const [endHour, endMin] = this.props.endTime.split(':').map(Number);
    return endHour * 60 + endMin - (startHour * 60 + startMin);
  }

  static create(
    dayOfWeek: string,
    startTime: string,
    endTime: string,
    timezone: string = 'Asia/Jakarta',
  ): Schedule {
    const normalizedDay = dayOfWeek.toLowerCase() as DayOfWeek;
    if (!Object.values(DayOfWeek).includes(normalizedDay)) {
      throw new Error(`Invalid day of week: ${dayOfWeek}`);
    }

    // Validate time format
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(startTime)) {
      throw new Error(`Invalid start time format: ${startTime}. Use HH:mm`);
    }
    if (!timeRegex.test(endTime)) {
      throw new Error(`Invalid end time format: ${endTime}. Use HH:mm`);
    }

    // Validate end time is after start time
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    if (endHour < startHour || (endHour === startHour && endMin <= startMin)) {
      throw new Error('End time must be after start time');
    }

    return new Schedule({
      dayOfWeek: normalizedDay,
      startTime,
      endTime,
      timezone,
    });
  }

  toDisplayString(): string {
    const dayCapitalized =
      this.props.dayOfWeek.charAt(0).toUpperCase() +
      this.props.dayOfWeek.slice(1);
    return `${dayCapitalized} ${this.props.startTime} - ${this.props.endTime}`;
  }
}
