export const TYPEORM_HISTORY_COLUMNS = 'TYPEORM_HISTORY_COLUMNS';

interface TrackFieldHistoryConfig {
  type?: 'object' | 'relation' | 'field';
}

export function TrackFieldHistory(config?: TrackFieldHistoryConfig): PropertyDecorator {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (target: Object, key: string | symbol) => {
    const fields = Reflect.getMetadata(TYPEORM_HISTORY_COLUMNS, target) || [];
    if (!fields.find(f => f.key === key)) {
      fields.push({ key, type: config?.type || 'field' });
    }
    Reflect.defineMetadata(TYPEORM_HISTORY_COLUMNS, fields, target);
  };
}
