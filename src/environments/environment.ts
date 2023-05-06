import { mockDB, requestMethodImpl } from '../mock-data';

export const environment = {
  production: false,
  mock: {
    db: mockDB,
    methods: requestMethodImpl
  }
};
