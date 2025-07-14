import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import axios from "axios";
import _ from "./Helpers.js";
import createBooking from "./create-booking.js";
import Cal from "./Cal.js";
import { format } from "date-fns";
import { knowledgeRetrieval } from "./knowledge-retrieval.js";

const JESSE_EVENT_TYPE_ID = 2512300;

export const server = new McpServer({
    name: "SalesToolServer",
    version: "1.0.0",
});

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

server.tool(
    "run-check_availability",
    "Fetch available time slots in a user's calendar between two dates.",
    {
        start: z
            .string()
            .describe("Start date (YYYY-MM-DD) to check for available slots, inclusive."),
        end: z.string().describe("End date (YYYY-MM-DD) to check for available slots, inclusive."),
        timeZone: z
            .enum([
                "America/Adak",
                "America/Anchorage",
                "America/Boise",
                "America/Chicago",
                "America/Denver",
                "America/Detroit",
                "America/Indiana/Indianapolis",
                "America/Indiana/Knox",
                "America/Indiana/Marengo",
                "America/Indiana/Petersburg",
                "America/Indiana/Tell_City",
                "America/Indiana/Vevay",
                "America/Indiana/Vincennes",
                "America/Indiana/Winamac",
                "America/Juneau",
                "America/Kentucky/Louisville",
                "America/Kentucky/Monticello",
                "America/Los_Angeles",
                "America/Menominee",
                "America/Metlakatla",
                "America/New_York",
                "America/Nome",
                "America/North_Dakota/Beulah",
                "America/North_Dakota/Center",
                "America/North_Dakota/New_Salem",
                "America/Phoenix",
                "America/Sitka",
                "America/Yakutat",
                "Pacific/Honolulu",
            ])
            .describe("The user's timezone (e.g., 'America/Denver', 'America/Chicago')"),
    },
    async ({ start, end, timeZone }) => {
        const result = await Cal.fetchSlotsBetweenDates({
            eventTypeId: JESSE_EVENT_TYPE_ID,
            start,
            end,
            timeZone: timeZone,
        });

        const formattedStart = format(new Date(start), "PPPP");
        const formattedEnd = format(new Date(end), "PPPP");

        let resultText = `There are no available time slots between ${formattedStart} - ${formattedEnd}`;

        if (result.success && result.data && Object.values(result.data).flat().length) {
            resultText = `Here are the available time slots between ${formattedStart} - ${formattedEnd}: ${JSON.stringify(
                result.data,
                null,
                4
            )}`;
        }

        return {
            content: [
                {
                    type: "text",
                    text: resultText,
                },
            ],
        };
    }
);

server.tool(
    "run-create_booking",
    "Create a booking at a specific date and time",
    {
        date: z.string().describe("The date for the booking (YYYY-MM-DD format)"),
        startTime: z
            .string()
            .describe("The start time for the booking (HH:MM format) - MM needs to be 00 or 30"),
        timeZone: z.string().describe("The timezone for the booking (e.g., 'America/Denver')"),
        attendeeName: z.string().describe("Name of the attendee"),
        attendeeEmail: z.string().email().describe("Email of the attendee"),
        summary: z.string().optional().describe("Optional: Summary of the meeting"),
    },
    async ({ date, startTime, timeZone, attendeeName, attendeeEmail, summary = "" }) => {
        const result = await createBooking(
            date,
            startTime,
            timeZone,
            attendeeName,
            attendeeEmail,
            summary
        );

        if (!result.success) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error: ${result.message}`,
                    },
                ],
            };
        }

        return {
            content: [
                {
                    type: "text",
                    text: result.message,
                },
            ],
        };
    }
);

server.tool(
    "run-get_information",
    "Retrieve detailed information from your knowledge base for teleperson-specific queries.",
    {
        question: z.string().describe("the user's question"),
    },
    async ({ question }) => {
        const result = await knowledgeRetrieval({ question, vendorName: "Teleperson" });

        if (!result.success) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error: ${result.message}`,
                    },
                ],
            };
        }

        return {
            content: [
                {
                    type: "text",
                    text: result.data,
                },
            ],
        };
    }
);
