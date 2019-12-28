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

export function streamCandle({
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
      if (!end) {
        const now = moment().utc();
        const delay = Math.max(
          moment(startMoment)
            .add(period, "m")
            .diff(now),
          0
        );
        setTimeout(async () => {
          const nowMoment = moment().utc();
          const minutes = Math.floor(
            Math.floor(nowMoment.get("m") / period) * period
          );
          const endMoment = moment(nowMoment)
            .startOf("h")
            .minute(minutes)
            .add(-1, "s");

          const response = await getExchange(exchange).getCandles({
            currency,
            asset,
            period,
            start: startMoment.toISOString(),
            end: endMoment.toISOString()
          });

          if (response.length) {
            startMoment = moment
              .utc(response[response.length - 1].time)
              .add(period, "m");
            rs.push(JSON.stringify(response));
          } else {
            startMoment = moment(endMoment).add(1, "s");
            rs.push(JSON.stringify([]));
          }
        }, delay);
      } else if (startMoment.isSameOrBefore(moment.utc(end))) {
        const response = await getExchange(exchange).getCandles({
          currency,
          asset,
          period,
          start: startMoment.toISOString(),
          end
        });
        if (response.length) {
          startMoment = moment
            .utc(response[response.length - 1].time)
            .add(period, "m");
          rs.push(JSON.stringify(response));
        }
      } else {
        rs.push(null);
      }
    }
  });
  return rs;
}
