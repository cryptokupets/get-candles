require("mocha");
const { assert } = require("chai");
const {
  readPairs,
  readPeriods,
  readExchanges,
  readCandlesStream
} = require("../lib/index");

const exchange = "hitbtc";

describe("readExchanges", () => {
  it("readExchanges является сервисом", function() {
    assert.isFunction(readExchanges);
    const exchanges = readExchanges();
    assert.isArray(exchanges);
    assert.include(exchanges, "hitbtc");
  });
});

describe("readPairs", () => {
  it("Если выполнить запрос readPairs, то вернется список поддерживаемых пар", function(done) {
    assert.isFunction(readPairs);
    readPairs(exchange).then(pairs => {
      assert.isNotEmpty(pairs);

      const pair = pairs[0];
      assert.hasAllKeys(pair, ["currency", "asset"]);
      done();
    });
  });
});

describe("readPeriods", () => {
  it("Если выполнить запрос readPeriods, то вернется список чисел", function(done) {
    assert.isFunction(readPeriods);
    readPeriods(exchange).then(periods => {
      assert.isNotEmpty(periods);

      const period = periods[0];
      assert.isNumber(period);
      done();
    });
  });
});

describe("readCandlesStream", () => {
  it("Если выполнить запрос readCandlesStream, то вернется Reader с элементами типа ICandle", function(done) {
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
    const rs = readCandlesStream(options);
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
});
