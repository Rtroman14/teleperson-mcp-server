import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import _ from "./Helpers.js";
import checkAvailability from "./check-availability.js";
import createBooking from "./create-booking.js";

export const server = new McpServer({
    name: "BookingToolServer",
    version: "1.0.0",
});

server.tool(
    "check_availability",
    "Check if a user is available at a specific date and time",
    {
        date: z.string().describe("The date to check availability for (YYYY-MM-DD format)"),
        timeZone: z
            .string()
            .describe("The user's timezone (e.g., 'America/Denver', 'America/Chicago')"),
    },
    async ({ date, timeZone }) => {
        const result = await checkAvailability(date, timeZone);

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
                    text: result.data.text,
                },
            ],
        };
    }
);

server.tool(
    "run-check_availability",
    "Check if a user is available at a specific date and time",
    {
        date: z.string().describe("The date to check availability for (YYYY-MM-DD format)"),
        timeZone: z
            .string()
            .describe("The user's timezone (e.g., 'America/Denver', 'America/Chicago')"),
    },
    async ({ date, timeZone }) => {
        const result = await checkAvailability(date, timeZone);

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

        // Log the availability window for debugging
        console.log(`availabilityWindow -->`, result.data.availabilityWindow);

        return {
            content: [
                {
                    type: "text",
                    text: result.data.text,
                },
            ],
        };
    }
);

server.tool(
    "create_booking",
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
