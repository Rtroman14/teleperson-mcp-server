import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import axios from "axios";

export const server = new McpServer({
    name: "WebsiteToolServer",
    version: "1.0.0",
});

server.tool(
    "contextualize_conversation",
    "Request the user's email address to scrape their domain and personalize the conversation.",
    {
        email: z.string().email().describe("The users email address (must be business email)"),
        // url: z.string().url().describe("The website URL to fetch content from"),
    },
    async ({ email }) => {
        try {
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

            if (response.statusText !== "OK") {
                throw new Error("Failed to fetch website content");
            }

            return {
                content: [
                    {
                        type: "text",
                        text: response.data,
                    },
                ],
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error fetching website: ${error.message}`,
                    },
                ],
            };
        }
    }
);

server.tool(
    "run-contextualize_conversation",
    "Request the user's email address to scrape their domain and personalize the conversation.",
    {
        email: z.string().email().describe("The users email address (must be business email)"),
        // url: z.string().url().describe("The website URL to fetch content from"),
    },
    async ({ email }) => {
        try {
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

            if (response.statusText !== "OK") {
                throw new Error("Failed to fetch website content");
            }

            return {
                content: [
                    {
                        type: "text",
                        text: response.data,
                    },
                ],
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error fetching website: ${error.message}`,
                    },
                ],
            };
        }
    }
);
