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

const checkAvailability = async (date) => {
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
        const availabilityResult = _.getAvailabilityWindow({
            targetDate: date,
            availability,
            timeZone,
        });
        if (!availabilityResult.success) {
            return {
                success: false,
                message: availabilityResult.message,
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
        const availabilityText = `Available hours: ${availabilityWindow.startTimeLocal} - ${availabilityWindow.endTimeLocal}`;

        const resultText = `${availabilityText}. ${
            busyTimes.length
                ? `The user is busy during these times: ${JSON.stringify(busyTimes)}`
                : `User is free all day on ${date}.`
        }`;

        return {
            success: true,
            data: {
                text: resultText,
                availabilityWindow,
                busyTimes,
                timeZone,
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
