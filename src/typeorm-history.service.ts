import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource, getMetadataArgsStorage } from 'typeorm';

import debugFactory from 'debug';
import { uniqBy } from 'lodash';

import { TYPEORM_HISTORY_HISTORY_FOR } from './history-for.decorator';
import { createHistorySubscriber } from './history.subscriber';

const debug = debugFactory('nest-typeorm-history:service');

@Injectable()
export class HistoryService {
  constructor(@InjectDataSource() dataSource: DataSource) {
    const entities = getMetadataArgsStorage().tables.reduce<any[]>((acc, t) => {
      const e = Reflect.getMetadata(TYPEORM_HISTORY_HISTORY_FOR, t.target);
      if (e !== undefined) {
        acc.push({
          entity: e,
          history: t.target,
        });
      }

      return acc;
    }, []);

    uniqBy(entities, e => e.entity)
      .map(({ entity, history }) => {
        debug(`Setting up history subscriber for ${entity.name}`);

        return createHistorySubscriber(entity, history);
      })
      .forEach(subscriber => dataSource.subscribers.push(subscriber));
  }

  // TODO inject request with user: https://github.com/nestjs/nest/issues/173
}
