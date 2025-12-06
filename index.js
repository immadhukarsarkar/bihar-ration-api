const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

// India proxy
const proxyURL = "https://proxy.scrapeops.io/v1/";
const apiKey = "free"; // temporary free proxy key

app.get("/check/:rc", async (req, res) => {
    const rc = req.params.rc;

    // REAL Bihar PDS URL
    const target = `https://epos.bihar.gov.in/FPS_Transaction_Details.jsp?rc_no=${rc}`;

    const url = `${proxyURL}?api_key=${apiKey}&url=${encodeURIComponent(target)}`;

    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        let status = "NOT_RECEIVED";
        let date = "";
        let wheat = "0";
        let rice = "0";

        $("table tr").each((i, row) => {
            const cols = $(row).find("td");

            if (cols.length > 3) {
                status = "RECEIVED";
                date = $(cols[1]).text().trim();
                wheat = $(cols[2]).text().trim();
                rice = $(cols[3]).text().trim();
            }
        });

        res.json({
            rc: rc,
            status: status,
            date: date,
            wheat: wheat,
            rice: rice
        });

    } catch (err) {
        res.json({ error: "Unable to fetch data", details: err.message });
    }
});

app.listen(PORT, () => console.log(`API Running with India Proxy`));

