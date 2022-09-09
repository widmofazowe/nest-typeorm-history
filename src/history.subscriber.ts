import debugFactory from 'debug';
import { get } from 'lodash';
import { EntityManager, EntitySubscriberInterface, InsertEvent, UpdateEvent } from 'typeorm';
import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata';
import { RelationMetadata } from 'typeorm/metadata/RelationMetadata';

import { RequestContext } from './request-context';
import { TYPEORM_HISTORY_COLUMNS } from './track-field-history.decorator';

const debug = debugFactory('nest-typeorm-history:subscriber');

interface FieldChange {
  field: string;
  oldValue?: string;
  newValue?: string;
}

export const createHistorySubscriber = <E extends { id: string }, H extends Record<string, any>>(
  entity,
  historyEntity,
) => {
  return new HistoryEntitySubscriber<E, H>(entity, historyEntity);
};

export class HistoryEntitySubscriber<EntityType extends { id: string }, HistoryEntityType>
  implements EntitySubscriberInterface<EntityType>
{
  constructor(private readonly entity, private readonly historyEntity) {}

  public listenTo() {
    return this.entity;
  }

  public async afterInsert(event: InsertEvent<EntityType>) {
    await this.createHistoryEntries(event.manager, event.entity.id, [{ field: 'CREATED' }]);
  }

  async afterUpdate(event: UpdateEvent<EntityType>) {
    const { entity, databaseEntity, updatedColumns, updatedRelations } = event;
    if (entity && databaseEntity) {
      const fieldChanges = this.getFieldChanges(
        event.manager,
        entity as EntityType,
        databaseEntity,
        updatedColumns,
        updatedRelations,
      );
      await this.createHistoryEntries(event.manager, databaseEntity.id, fieldChanges);
    }
  }

  getChangedColumns(fields, updatedColumns: ColumnMetadata[]) {
    return updatedColumns
      .filter(columnMetadata =>
        fields
          .filter(f => f.type !== 'relation')
          .find(f => {
            const { propertyName, propertyPath } = columnMetadata;
            if (f.type === 'object') {
              const [objectPropertyName] = propertyPath.split('.');

              return objectPropertyName === f.key;
            }

            return propertyName === f.key;
          }),
      )
      .map(columnMetadata => ({
        name: columnMetadata.propertyPath,
        field: columnMetadata.propertyPath,
      }));
  }

  private getChangedRelations(fields, updatedRelations: RelationMetadata[]) {
    return updatedRelations
      .filter(relationMetadata =>
        fields
          .filter(f => f.type === 'relation')
          .find(f => {
            const { propertyName } = relationMetadata;

            return propertyName === f.key;
          }),
      )
      .map(relationMetadata => ({
        name: relationMetadata.propertyPath,
        field: `${relationMetadata.propertyPath}.id`,
      }));
  }

  private getFieldChanges(
    manager: EntityManager,
    entity: EntityType,
    databaseEntity: EntityType,
    updatedColumns: ColumnMetadata[],
    updatedRelations: RelationMetadata[],
  ) {
    try {
      const e = manager.create(this.entity, entity);
      const hasColumnsToTrack = Reflect.hasMetadata(TYPEORM_HISTORY_COLUMNS, e);

      if (!e || !hasColumnsToTrack) {
        return [];
      }

      const fields = Reflect.getMetadata(TYPEORM_HISTORY_COLUMNS, e) || [];
      const fieldChanges: FieldChange[] = [];
      const updatedColumnMetadata = this.getChangedColumns(fields, updatedColumns).concat(
        this.getChangedRelations(fields, updatedRelations),
      );
      for (const { name, field } of updatedColumnMetadata) {
        const oldValue = get(databaseEntity, field);
        const newValue = get(entity, field);
        fieldChanges.push({ field: name, oldValue, newValue });
      }

      return fieldChanges;
    } catch (e) {
      debug(e);
    }

    return [];
  }

  private async createHistoryEntries(manager: EntityManager, objectId: string, fieldChanges: FieldChange[]) {
    try {
      const currentUser = RequestContext.currentUser();

      await manager.save(
        this.historyEntity,
        fieldChanges.map(
          fieldChange => ({ objectId, ...fieldChange, modifiedById: currentUser?.id } as unknown as HistoryEntityType),
        ),
      );
    } catch (e) {
      debug(e);
    }
  }
}
