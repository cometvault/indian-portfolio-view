# Data JSON schema

## data/ipo.json
- updated: ISO datetime with IST offset
- source: named string (e.g. ipowatch.in)
- mainboard[] / sme[]: name, priceBand, lotSize, minAmount, issueSize, subscription, opens, closes, listing, status, gmp

## data/gold.json
- updated, source, note
- cities[]: city, rate22k, rate24k, change24k

UI treats data older than 36h as stale.
