require("mocha");
const { assert } = require("chai");
const {
  getPairs,
  getPeriods,
  getExchanges,
  streamCandle
} = require("../lib/index");

const exchange = "hitbtc";

describe("getExchanges", () => {
  it("getExchanges является сервисом", function() {
    assert.isFunction(getExchanges);
    const exchanges = getExchanges();
    assert.isArray(exchanges);
    assert.include(exchanges, "hitbtc");
  });
});

describe("getPairs", () => {
  it("Если выполнить запрос getPairs, то вернется список поддерживаемых пар", function(done) {
    assert.isFunction(getPairs);
    getPairs(exchange).then(pairs => {
      assert.isNotEmpty(pairs);

      const pair = pairs[0];
      assert.hasAllKeys(pair, ["currency", "asset"]);
      done();
    });
  });
});

describe("getPeriods", () => {
  it("Если выполнить запрос readPeriods, то вернется список чисел", function(done) {
    assert.isFunction(getPeriods);
    getPeriods(exchange).then(periods => {
      assert.isNotEmpty(periods);

      const period = periods[0];
      assert.isNumber(period);
      done();
    });
  });
});

describe("streamCandle", () => {
  it("Если выполнить запрос streamCandle, то вернется Reader с элементами типа ICandle", function(done) {
    this.timeout(5000);
    let i = 0;
    const options = {
      exchange,
      currency: "USD",
      asset: "BTC",
      period: 1,
      start: "2019-10-01",
      end: "2019-10-02"
    };
    const rs = streamCandle(options);
    rs.on("data", chunk => {
      const candles = JSON.parse(chunk.toString());
      assert.isArray(candles);
      assert.isNotEmpty(candles);
      const candle = candles[0];
      assert.hasAllKeys(candle, [
        "time",
        "open",
        "high",
        "low",
        "close",
        "volume"
      ]);
      assert.isString(candle.time);
      assert.isNumber(candle.open);
      assert.isNumber(candle.high);
      assert.isNumber(candle.low);
      assert.isNumber(candle.close);
      assert.isNumber(candle.volume);
      i++;
    });

    rs.on("end", () => {
      // assert.equal(i, 10, "Данные должны лежать внутри диапазона");
      done();
    });
  });

  it("если end не указана, то будет выполняться по мере поступления новых данных", function(done) {
    this.timeout(80000);
    let i = 0;
    const options = {
      exchange: "hitbtc",
      currency: "USD",
      asset: "BTC",
      period: 1,
      start: "2019-11-07T18:10:00"
    };
    const rs = streamCandle(options);
    rs.on("data", chunk => {
      i++;
    });

    setTimeout(() => rs.destroy(), 70000);

    rs.on("end", () => {
      assert.fail("не должен завершиться");
      done();
    });

    rs.on("close", () => {
      assert.isAbove(i, 1, "как минимум второй раз");
      done();
    });
  });
});
