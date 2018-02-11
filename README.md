# sec-data

Sec data exploration

[Philip Carret](https://www.csmonitor.com/1995/0227/27081.html)

“It is very simple; buy good companies and sit on them. There are good well-managed companies, which are a relative handful. There are companies that have moderately good management, which at least are not going bankrupt but probably are not going to give their stockholders glowing returns. There are companies which are over-leveraged — they owe a lot of money and are skating along on thin ice; when things get tough they are going to go bankrupt. So the job of an investment manager is to pick the good [companies] and sit on [their stock for many years].

One of the great faults of investment analysts is to try to put limits on what they recommend. They say, for example, 'Here’s a stock selling at $12 [a share]. Sell at $18 a share.' That’s nonsense. If that’s all you expect out of it, leave it alone. If you buy it at $12 and you think it might double, one should feel comfortable in buying it. Probably the greatest performer in recent history is Berkshire Hathaway. [Berkshire Hathaway Inc., based in Omaha, Neb.] I bought the stock about 10 years ago at $400. Imagine how I’d feel if I sold it at $800. [It was recently selling at more than $24,000.] Why sell anything unless something goes wrong?"

## UPDATES

* crawl missing filing links for existing stock resources
[Stock.updateMissingStockFilings();](https://github.com/ansteh/sec-data/blob/master/lib/stock/test.js)

* download missing filing files by filing links
[Stock.downloadMissingFilingFilesBy();](https://github.com/ansteh/sec-data/blob/master/lib/stock/test.js)

* parse unparsed filing files
[Stock.parseUnparsedFilings();](https://github.com/ansteh/sec-data/blob/master/lib/stock/test.js)

* update summaries
[Stock.parseUnparsedFilings();](https://github.com/ansteh/sec-data/blob/master/lib/stock/test.js)

* update summaries
[Summary.prepareAndSaveAll();](https://github.com/ansteh/sec-data/blob/master/lib/stock/summary/test.js)

* update prices
[Price.updateAll();](https://github.com/ansteh/sec-data/blob/master/lib/stock/price/test.js)
