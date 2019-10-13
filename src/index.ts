import { Exchange as Hitbtc } from "hitbtc-connect";
import moment from "moment";

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

export function getPairs(
  exchange: string
): Promise<Array<{ currency: string; asset: string }>> {
  return getExchange(exchange).getPairs();
}

export function getPeriods(exchange: string): Promise<number[]> {
  return getExchange(exchange).getPeriods();
}

export function getExchanges(): string[] {
  return Object.keys(exchanges);
}

export async function getCandles({
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
  start: string;
  end: string;
}): Promise <ICandle[]> {
  let startMoment = moment.utc(start);

  const candles: ICandle[] = [];
  let responseLength;

  do {
    const response = await getExchange(exchange).getCandles({
      currency,
      asset,
      period,
      start: startMoment.toISOString(),
      end
    });

    responseLength = response.length;
    if (responseLength) {
      for (const candle of response) {
        candles.push(candle);
      }
      startMoment = moment
        .utc(response[responseLength - 1].time)
        .add(period, "m");
    }
  } while (responseLength && startMoment.isSameOrBefore(moment.utc(end)));
  return candles;
}
