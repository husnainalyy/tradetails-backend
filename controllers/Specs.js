const puppeteer = require("puppeteer");

exports.specs = async (req, res) => {
  const { model } = req.body;
  if (!model) return res.status(400).json({ error: "Model name is required" });

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-gpu",
        "--single-process",
      ],
    });
    const page = await browser.newPage();

    // Block unnecessary resources
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      if (["image", "stylesheet", "font"].includes(request.resourceType())) {
        request.abort();
      } else {
        request.continue();
      }
    });

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36"
    );
    await page.setViewport({ width: 1366, height: 768 });

    // Navigate to the search results page
    await page.goto(
      `https://www.gsmarena.com/res.php3?sSearch=${encodeURIComponent(model)}`,
      { waitUntil: "domcontentloaded", timeout: 50000 }
    );

    // Check if the search results contain the model link
    const phoneLinkExists = await page.$("div.makers a");
    if (!phoneLinkExists) {
      await browser.close();
      return res
        .status(404)
        .json({ error: "Phone model not found in search results" });
    }

    const phoneLink = await page.evaluate(() => {
      return document.querySelector("div.makers a").href;
    });

    // Navigate to the phone's detail page
    await page.goto(phoneLink, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // Wait for the specs table (inside the #specs-list div) to load
    await page.waitForSelector("#specs-list", { timeout: 30000 });

    // Extract phone title
    const phoneTitle = await page.evaluate(
      () => document.querySelector(".specs-phone-name-title")?.innerText
    );

    // Extract specific phone specs
    const phoneSpecs = await page.evaluate(() => {
      const specs = {};
      const desiredCategories = [
        "Body",
        "Display",
        "Platform",
        "Main Camera",
        "Selfie Camera",
        "Battery",
      ];

      document.querySelectorAll("#specs-list > table").forEach((table) => {
        const categoryTitle = table.querySelector("th")?.innerText;
        if (categoryTitle && desiredCategories.includes(categoryTitle)) {
          const subSpecs = {};
          table.querySelectorAll("tr").forEach((row) => {
            const subCategory = row.querySelector("td.ttl")?.innerText;
            const subValue = row.querySelector("td.nfo")?.innerText;
            if (subCategory && subValue) {
              subSpecs[subCategory] = subValue;
            }
          });
          if (Object.keys(subSpecs).length > 0) {
            specs[categoryTitle] = subSpecs;
          }
        }
      });
      return specs;
    });

    await browser.close();

    if (!phoneTitle || Object.keys(phoneSpecs).length === 0) {
      return res.status(404).json({ error: "Unable to retrieve phone specs" });
    }

    res.json({
      model: phoneTitle,
      specs: phoneSpecs,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return res
      .status(500)
      .json({ error: "Something went wrong during scraping" });
  }
};

// async function getTrendingJobs() {
//   // Launch the browser
//   const browser = await puppeteer.launch({
//     headless: true,
//     args: ["--no-sandbox", "--disable-setuid-sandbox"],
//   });

//   // Open a new page
//   const page = await browser.newPage();

//   // Go to the Upwork Jobs Page (example: https://www.upwork.com/ab/jobs/)
//   await page.goto("https://www.upwork.com/ab/jobs/");

//   // Wait for the jobs list to load (you can target a specific element that contains jobs)
//   await page.waitForSelector(".job-tile");

//   // Scrape the job titles and other information
//   const jobs = await page.evaluate(() => {
//     const jobElements = document.querySelectorAll(".job-tile");
//     const jobList = [];

//     jobElements.forEach((job) => {
//       const title = job.querySelector(".job-title")
//         ? job.querySelector(".job-title").innerText
//         : "No Title";
//       const description = job.querySelector(".job-description")
//         ? job.querySelector(".job-description").innerText
//         : "No Description";
//       const link = job.querySelector("a")
//         ? job.querySelector("a").href
//         : "No Link";

//       jobList.push({ title, description, link });
//     });

//     return jobList;
//   });

//   // Close the browser
//   await browser.close();

//   // Return the scraped data
//   return jobs;
// }

// (async () => {
//   const jobs = await getTrendingJobs();
//   console.log(jobs); // Output the scraped job data
// })();
