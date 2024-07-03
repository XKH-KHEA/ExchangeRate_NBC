// const express = require("express");
// const puppeteer = require("puppeteer");
// const cheerio = require("cheerio");
// const cors = require("cors");
// require("dotenv").config();
// const app = express();
// app.use(cors());

// let browser; // Reuse Puppeteer browser instance

// const fetchDataForDate = async (page, dateFilter) => {
//   try {
//     await page.goto(
//       "https://www.nbc.gov.kh/english/economic_research/exchange_rate.php"
//     );

//     await page.waitForSelector("#datepicker");

//     await page.$eval(
//       "#datepicker",
//       (datepicker, dateFilter) => {
//         datepicker.value = dateFilter;
//       },
//       dateFilter
//     );

//     await Promise.all([
//       page.click('input[name="view"]'), // Click on the "View" button
//       page.waitForNavigation({ waitUntil: "networkidle0" }), // Wait for navigation
//     ]);

//     await page.waitForSelector("table.tbl-responsive");

//     const content = await page.content();
//     const $ = cheerio.load(content);

//     const officialExchangeRateRow = $('td:contains("Official Exchange Rate")');
//     const officialExchangeRateText = officialExchangeRateRow.text();
//     const officialExchangeRateMatch = officialExchangeRateText.match(/(\d+)/);
//     const officialExchangeRate = officialExchangeRateMatch
//       ? parseInt(officialExchangeRateMatch[1])
//       : null;
//     bid = officialExchangeRate;
//     return {
//       currency: "USD",
//       symbol: "USD/KHR",
//       unit: "1",
//       bid,
//       ask: "",

//       // date: dateFilter,
//     };
//   } catch (error) {
//     console.error("Error fetching data for date", dateFilter, ":", error);
//     return { error: error.message };
//   }
// };

// app.get("/data", async (req, res) => {
//   try {
//     const today = new Date().toISOString().split("T")[0];
//     const dateFilter = req.query.date || today;

//     if (!browser) {
//       browser = await puppeteer.launch({
//         headless: true,
//         args: ["--no-sandbox", "--disable-setuid-sandbox"],
//         executablePath:
//           process.env.NODE_ENV === "production"
//             ? process.env.PUPPETEER_EXECUTABLE_PATH
//             : undefined, // Use default executable path
//       });
//     }

//     const page = await browser.newPage();

//     const result = await fetchDataForDate(page, dateFilter);
//     const response = {
//       ok: true,
//       value: [result],
//     };
//     res.json(response);
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: error.message });
//   }
// });

// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });