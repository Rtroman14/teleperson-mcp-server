import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import Cal from "./Cal.js";
import _ from "./Helpers.js";
import { toZonedTime, formatInTimeZone } from "date-fns-tz";

export const server = new McpServer({
    name: "BookingToolServer",
    version: "1.0.0",
});

// Function to fetch calendars and extract credential information
const fetchCalendars = async () => {
    try {
        const calendarsResponse = await Cal.fetchCalendars();

        // Extract credentialId and externalId from the primary calendar
        const primaryCalendar = calendarsResponse.data.data.connectedCalendars[0].primary;
        const credentialId = primaryCalendar.credentialId;
        const externalId = primaryCalendar.externalId;

        return { credentialId, externalId };
    } catch (error) {
        console.error("Error fetching calendars:", error);
        throw error;
    }
};

server.tool(
    "check_availability",
    "Check if a user is available at a specific date and time",
    {
        date: z.string().describe("The date to check availability for (YYYY-MM-DD format)"),
    },
    async ({ date }) => {
        try {
            // Fetch calendars and get credentials
            const { credentialId, externalId } = await fetchCalendars();

            const me = await Cal.fetchMe();
            if (!me.success) throw new Error(me.message);
            const timeZone = me.data.data.timeZone;

            // Fetch schedules to get availability
            const schedules = await Cal.fetchSchedules();
            if (!schedules.success) throw new Error(schedules.message);
            const availability = schedules.data.data[0].availability;

            // Get availability window for the target date
            const availabilityResult = _.getAvailabilityWindow({ date, availability, timeZone });
            if (!availabilityResult.success) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error: ${availabilityResult.message}`,
                        },
                    ],
                };
            }

            const startDate = new Date(`${date}T00:00:00`);
            const endDate = new Date(`${date}T23:59:59`);

            // Format the dates with time component
            const dateFrom = formatInTimeZone(startDate, timeZone, "yyyy-MM-dd'T'HH:mm:ss");
            const dateTo = formatInTimeZone(endDate, timeZone, "yyyy-MM-dd'T'HH:mm:ss");

            const busyTimesResponse = await Cal.fetchBusyTimes({
                loggedInUsersTz: timeZone,
                dateFrom,
                dateTo,
                credentialId,
                externalId,
            });

            if (!busyTimesResponse.success) throw new Error(busyTimesResponse.message);

            const busyTimes = busyTimesResponse.data.data.map((meeting) => {
                const start = formatInTimeZone(new Date(meeting.start), timeZone, "h:mm a");
                const end = formatInTimeZone(new Date(meeting.end), timeZone, "h:mm a");

                return {
                    busy: `${start} - ${end}`,
                };
            });

            // Format the availability window times
            const availabilityWindow = availabilityResult.data;
            const availabilityText = `Available hours: ${availabilityWindow.startTimeLocal} - ${availabilityWindow.startTimeLocal}`;

            return {
                content: [
                    {
                        type: "text",
                        text: `${availabilityText}. ${
                            busyTimes.length
                                ? `The user is busy during these times: ${JSON.stringify(
                                      busyTimes
                                  )}`
                                : `User is free all day on ${date}.`
                        }`,
                    },
                ],
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error checking availability: ${error.message}`,
                    },
                ],
            };
        }
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
