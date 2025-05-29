import Cal from "./Cal.js";
import _ from "./Helpers.js";
import { formatInTimeZone } from "date-fns-tz";

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

const checkAvailability = async (date, userTimeZone) => {
    try {
        // Fetch calendars and get credentials
        const { credentialId, externalId } = await fetchCalendars();

        const me = await Cal.fetchMe();
        if (!me.success) throw new Error(me.message);
        const timeZone = me.data.data.timeZone;

        console.log(`Calendar owner's timeZone -->`, timeZone);
        console.log(`User's timeZone -->`, userTimeZone);

        // Fetch schedules to get availability
        const schedules = await Cal.fetchSchedules();
        if (!schedules.success) throw new Error(schedules.message);
        const availability = schedules.data.data[0].availability;
        const availabilityTimezone = schedules.data.data[0].timeZone;

        console.log(`availabilityTimezone -->`, availabilityTimezone);

        // Get availability window for the target date using proper timezone conversion
        const availabilityResult = _.getAvailabilityWindow({
            targetDate: date,
            availability,
            calendarOwnerTimeZone: availabilityTimezone,
            userTimeZone: userTimeZone,
        });
        if (!availabilityResult.success) {
            return {
                success: false,
                message: availabilityResult.message,
            };
        }

        const startDate = new Date(`${date}T00:00:00`);
        const endDate = new Date(`${date}T23:59:59`);

        // Format the dates with time component using calendar owner's timezone for API call
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
            // Convert busy times to user's timezone
            const start = formatInTimeZone(new Date(meeting.start), userTimeZone, "h:mm a");
            const end = formatInTimeZone(new Date(meeting.end), userTimeZone, "h:mm a");

            return `${start} - ${end}`;
        });

        // De-duplicate busyTimes by converting to Set and back to array
        const uniqueBusyTimes = [...new Set(busyTimes)];

        // Format the availability window times (already in user's timezone from getAvailabilityWindow)
        const availabilityWindow = availabilityResult.data;
        const availabilityText = `Available hours: ${availabilityWindow.startTimeLocal} - ${availabilityWindow.endTimeLocal}`;

        const resultText = `${availabilityText}. ${
            uniqueBusyTimes.length
                ? `The user is busy during these times: ${JSON.stringify(uniqueBusyTimes)}`
                : `User is free all day on ${date}.`
        }`;

        return {
            success: true,
            data: {
                text: resultText,
                availabilityWindow,
                busyTimes: uniqueBusyTimes,
            },
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: error.message,
        };
    }
};

export default checkAvailability;
