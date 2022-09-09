## Features

- Provide a way to store entities history
- Provide easy to use options by default

## Installation

```bash
$ npm i --save nest-history
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
  configure(consumer: MiddlewareCOnsumer) {
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

