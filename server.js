const express = require("express");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());

app.get("/data", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const dateFilter = req.query.date || today;
    const symbolFilter = req.query.symbol || null;

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : undefined, // Use default executable path
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36"
    );

    await page.goto(
      "https://www.nbc.gov.kh/english/economic_research/exchange_rate.php"
    );

    await page.waitForSelector("#datepicker");
    await page.$eval(
      "#datepicker",
      (datepicker, dateFilter) => {
        datepicker.value = dateFilter;
      },
      dateFilter
    );

    await Promise.all([
      page.waitForNavigation(), // Wait for page navigation
      page.click('input[name="view"]'), // Click on the "View" button
    ]);

    await page.waitForSelector("table.tbl-responsive");

    const content = await page.content();
    const $ = cheerio.load(content);

    const exchangeRates = [];

    $("table.tbl-responsive tr").each((index, element) => {
      if (index > 0) {
        const columns = $(element).find("td");
        const currency = columns.eq(0).text().trim();
        const symbol = columns.eq(1).text().trim();
        const unit = columns.eq(2).text().trim();
        const bid = columns.eq(3).text().trim();
        const ask = columns.eq(4).text().trim();

        const exchangeRate = { currency, symbol, unit, bid, ask };

        if (!symbolFilter || symbol === symbolFilter) {
          exchangeRates.push(exchangeRate);
        }
      }
    });

    const officialExchangeRateRow = $('td:contains("Official Exchange Rate")');
    const officialExchangeRateText = officialExchangeRateRow.text();
    const officialExchangeRateMatch = officialExchangeRateText.match(/(\d+)/);
    const officialExchangeRate = officialExchangeRateMatch
      ? parseInt(officialExchangeRateMatch[1])
      : null;

    await browser.close();

    if (officialExchangeRate) {
      const officialExchangeRateObj = {
        currency: "KHR",
        symbol: "KHR/USD",
        unit: "1",
        bid: officialExchangeRate,
        ask: "",
      };

      if (!symbolFilter || officialExchangeRateObj.symbol === symbolFilter) {
        exchangeRates.push(officialExchangeRateObj);
      }
    }

    const response = {
      ok: true,
      value: exchangeRates,
    };

    res.json(response);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
