import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import Cal from "./Cal.js";
import _ from "./Helpers.js";
import { toZonedTime, formatInTimeZone } from "date-fns-tz";
import checkAvailability from "./check-availability.js";

export const server = new McpServer({
    name: "BookingToolServer",
    version: "1.0.0",
});

server.tool(
    "check_availability",
    "Check if a user is available at a specific date and time",
    {
        date: z.string().describe("The date to check availability for (YYYY-MM-DD format)"),
    },
    async ({ date }) => {
        const result = await checkAvailability(date);

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
    },
    async ({ date }) => {
        const result = await checkAvailability(date);

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
        try {
            // Create a zoned time for the meeting
            const localtime = toZonedTime(new Date(`${date}T${startTime}:00`), timeZone);

            // Convert to UTC ISO string
            const startTimeUTC = localtime.toISOString();

            const bookingData = {
                start: startTimeUTC,
                attendee: {
                    name: attendeeName,
                    email: attendeeEmail,
                    timeZone: timeZone,
                },
                eventTypeId: 2485287,
                metadata: {
                    summary: summary,
                },
            };

            const response = await Cal.createBooking(bookingData);

            if (!response.success) {
                throw new Error(response.message || "Failed to create booking");
            }

            return {
                content: [
                    {
                        type: "text",
                        text: `Booking created successfully for ${attendeeName} on ${date} at ${startTime}.`,
                    },
                ],
            };
        } catch (error) {
            console.error("create_booking: ", error);
            return {
                content: [
                    {
                        type: "text",
                        text: `Error creating booking: ${error.message}`,
                    },
                ],
            };
        }
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
        try {
            // Create a zoned time for the meeting
            const localtime = toZonedTime(new Date(`${date}T${startTime}:00`), timeZone);

            // Convert to UTC ISO string
            const startTimeUTC = localtime.toISOString();

            const bookingData = {
                start: startTimeUTC,
                attendee: {
                    name: attendeeName,
                    email: attendeeEmail,
                    timeZone: timeZone,
                },
                eventTypeId: 2485287,
                metadata: {
                    summary: summary,
                },
            };

            const response = await Cal.createBooking(bookingData);

            if (!response.success) {
                throw new Error(response.message || "Failed to create booking");
            }

            return {
                content: [
                    {
                        type: "text",
                        text: `Booking created successfully for ${attendeeName} on ${date} at ${startTime}.`,
                    },
                ],
            };
        } catch (error) {
            console.error("create_booking: ", error);
            return {
                content: [
                    {
                        type: "text",
                        text: `Error creating booking: ${error.message}`,
                    },
                ],
            };
        }
    }
);
