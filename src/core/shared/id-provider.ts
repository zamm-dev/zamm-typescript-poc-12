import { IdProvider } from './types';

export class RandomIdProvider implements IdProvider {
  generateId(): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';

    let id = '';
    for (let i = 0; i < 3; i++) {
      id += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    for (let i = 0; i < 3; i++) {
      id += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }

    return id;
  }
}

let globalIdProvider: IdProvider = new RandomIdProvider();

export function setIdProvider(provider: IdProvider): void {
  globalIdProvider = provider;
}

export function resetIdProvider(): void {
  globalIdProvider = new RandomIdProvider();
}

export function getIdProvider(): IdProvider {
  return globalIdProvider;
}
