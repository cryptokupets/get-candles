require("mocha");
const { assert } = require("chai");
const { getPairs, getPeriods, getExchanges, getCandles } = require("../lib/index");

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
  it("Если выполнить запрос getPeriods, то вернется список чисел", function(done) {
    assert.isFunction(getPeriods);
    getPeriods(exchange).then(periods => {
      assert.isNotEmpty(periods);

      const period = periods[0];
      assert.isNumber(period);
      done();
    });
  });
});

describe("getCandles", () => {
  it("Если выполнить запрос getCandles, то вернется список типа ICandle", function(done) {
    assert.isFunction(getCandles);
    const options = {
      exchange,
      currency: "USD",
      asset: "BTC",
      period: 1,
      start: "2019-10-01",
      end: "2019-10-02"
    };
    getCandles(options).then(candles => {
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
      done();
    });
  });
});
