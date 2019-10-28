import { Exchange as Hitbtc } from "hitbtc-connect";
import moment from "moment";
import { Readable } from "stream";

const exchanges: any = {
  hitbtc: new Hitbtc()
};

function getExchange(exchange: string): IMarketDataSource {
  return exchanges[exchange] as IMarketDataSource;
}

interface ICandle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface IMarketDataSource {
  getPairs(): Promise<Array<{ currency: string; asset: string }>>;
  getPeriods(): Promise<number[]>;
  getCandles(options: {
    currency: string;
    asset: string;
    period: number;
    start: string;
    end: string;
  }): Promise<ICandle[]>;
}

export function readPairs(
  exchange: string
): Promise<Array<{ currency: string; asset: string }>> {
  return getExchange(exchange).getPairs();
}

export function readPeriods(exchange: string): Promise<number[]> {
  return getExchange(exchange).getPeriods();
}

export function readExchanges(): string[] {
  return Object.keys(exchanges);
}

export function readCandlesStream({
  exchange,
  currency,
  asset,
  period,
  start,
  end
}: {
  exchange: string;
  currency: string;
  asset: string;
  period: number;
  start?: string;
  end?: string;
}): Readable {
  let startMoment = moment.utc(start);
  const rs = new Readable({
    read: async () => {
      if (startMoment.isSameOrBefore(moment.utc(end))) {
        const response = await getExchange(exchange).getCandles({
          currency,
          asset,
          period,
          start: startMoment.toISOString(),
          end
        });
        startMoment = moment
          .utc(response[response.length - 1].time)
          .add(period, "m");
        if (response.length) {
          rs.push(JSON.stringify(response));
        }
      } else {
        rs.push(null);
      }
    }
  });
  return rs;
}
