## Features

- Provide a way to store entities history
- Provide easy to use options by default

## Installation

```bash
$ npm i --save nest-typeorm-history
```

## Usage

In our root module import TypeOrmHistoryModule and add middleware for all paths:

```
@Module({
  imports: [
    //...our other imports
    TypeOrmHistoryModule,
  ],
  ...
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRouter({ path: '*', method: RequestMethod.ALL });
  }
}
```

Now let's define some example entity:

```
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  name: string;
}
```

After that we can create our history entity

```
@Entity()
@HistoryFor(User)
export class UserHistory extends HistoryEntity {}
```

By defualt no fields are tracked, so now we need to go to our user entity and modify it accordingly:

```
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @TrackFieldHistory()
  email: string;

  @Column()
  @TrackFieldHistory()
  name: string;
}
```
