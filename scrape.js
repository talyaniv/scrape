// import puppeteer from 'puppeteer';
const puppeteer = require('puppeteer');

if (!process.argv[2]){
  console.log('Please provide a URL to scrape')
  process.exit(1);
}
const url = process.argv[2]

let documentCount = 0;

const scrape = async () => {
  console.time('Execution Time');

  console.log('launching Puppeteer headless browser')
  const browser = await puppeteer.launch({headless: 'new'});

  console.log('opening a new browser page')
  const page = await browser.newPage();
  await page.setRequestInterception(true)
  const exclude = ['image', 'media', 'ping', 'fetch', 'other', 'xhr', 'font']

  page.on('request', req => {
    const requestType = req.resourceType()
    if (exclude.includes(requestType)) {
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      process.stdout.write('aborting ' + requestType)
      req.abort();
    } else {
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      process.stdout.write('reading ' + requestType)
      req.continue();
    }
  });

  console.log(`navigating to ${url}`)
  console.log('')
  await page.goto(url, {waitUntil: 'networkidle0', timeout: 100000});
  // await page.waitForSelector('document', { visible: true });

  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  console.log('')
  
  console.log('reading <article> tags...')
  
  const articles = await page.evaluate(() => {

    const article = document.querySelector("article");

    const text = article?.innerText || article;

    return text;
  });

  console.log('============== RESULTS: ==============')

  // Display the quotes
  console.log(articles);

  await page.close();

  await browser.close();
  
  console.log('============== Done     ==============')
  console.timeEnd('Execution Time');
}

scrape();