
import { gotScraping } from 'got-scraping';
import * as cheerio from 'cheerio';



async function scrapePage(url, baseUrl) {
  try {
    const response = await gotScraping.get(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.statusCode}`);
    }
    const html = response.body;
    const $ = cheerio.load(html);

    // Generated scraping function
    const scrapeData = () => {
      const products = [];

      $('.tt-product').each((index, element) => {
        const title = $(element).find('.tt-title').text().trim();
        const price = $(element).find('.tt-price .money').text().trim();
        const link = $(element).find('.tt-title a').attr('href');
        const url = link ? new URL(link, baseUrl).toString() : null;

        products.push({
          "": `${title} - ${price} - ${url}`
        });
      });

      return products;
    };

    const scrapedData = scrapeData();

    return { success: true, data: scrapedData, url: url };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error scraping page ${url}:`, error);
    return { success: false, error: error.message, url: url };
  }
}

// Usage example:
scrapePage('https://wcproducts.com/collections/viewall', "https://wcproducts.com/").then(result => console.log(result));


