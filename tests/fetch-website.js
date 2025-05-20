import "dotenv/config";
import axios from "axios";

(async () => {
    try {
        const email = "ryan@webagent.ai";

        const domain = email.split("@").at(-1);

        const response = await axios.get(`https://r.jina.ai/https://${domain}`, {
            headers: {
                Authorization: `Bearer ${process.env.JINYA_API_KEY}`,
                "X-Md-Bullet-List-Marker": "-",
                "X-Md-Em-Delimiter": "*",
                "X-Remove-Selector": `header, nav, input, iframe, footer, .footer, #footer, #nav, .elementor-button, [data-elementor-type="header"], [style*="display: none"], [style*="visibility: hidden"], aside, script, button, style, img`,
                "X-Retain-Images": "none",
                "X-With-Generated-Alt": "true",
            },
        });

        if (response.statusText !== "OK") throw new Error(response.data);

        console.log(`response.data -->`, response.data);
    } catch (error) {
        console.error(error);
    }
})();
