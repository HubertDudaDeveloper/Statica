export interface Transaction {
  n: number;
  t: string;
  p: string;
  v: number;
  u: string;
}

export class TransactionService {
  private counter = 0;

  generate(): Transaction {
    const now = new Date();
    const time = `${now.toLocaleTimeString("pl-PL", { hour12: false })}.${now.getMilliseconds().toString().padStart(3, "0")}`;
    const price = (Math.random() * 100 + 100).toFixed(2);
    const volume = Math.floor(Math.random() * 500) + 1;
    const value = (parseFloat(price) * volume).toFixed(2);

    return {
      n: this.counter++,
      t: time,
      p: price,
      v: volume,
      u: value,
    };
  }
}
