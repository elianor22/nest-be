import { Module } from '@nestjs/common';
import dataSource from './data-source';

@Module({
  providers: [
    {
      provide: 'DATA_SOURCE',
      useFactory: async () => {
        await dataSource.initialize(); // Initialize DataSource
        return dataSource; // Return the initialized DataSource
      },
    },
  ],
  exports: ['DATA_SOURCE'],
})
export class DatabaseModule {}
