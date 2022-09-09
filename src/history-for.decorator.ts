import { Type } from '@nestjs/common';

export const TYPEORM_HISTORY_HISTORY_FOR = 'TYPEORM_HISTORY_HISTORY_FOR';

export function HistoryFor<E>(e: Type<E>) {
  return (target: any) => {
    Reflect.defineMetadata(TYPEORM_HISTORY_HISTORY_FOR, e, target);
  };
}
