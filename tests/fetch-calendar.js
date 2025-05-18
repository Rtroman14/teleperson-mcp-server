// {"status":"success","data":{"id":1537157,"email":"ryan@webagent.ai","timeFormat":12,"defaultScheduleId":661792,"weekStart":"Sunday","timeZone":"America/Denver","username":"webagent","organizationId":null}}

// * Bookings
// https://cal.com/docs/api-reference/v2/bookings/get-all-bookings

// TODO: timezone = https://www.npmjs.com/package/geo-tz

// Fetch calendars and extract credential information
import Cal from "../src/Cal.js";
import { toZonedTime, formatInTimeZone } from "date-fns-tz";
import cityTimezones from "city-timezones";
import { format } from "date-fns";
import _ from "../src/_.js";

// Function to fetch calendars and print their details
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

const fetchBusyTimes = async ({ targetDate }) => {
    try {
        // Fetch calendars and get credentials
        const { credentialId, externalId } = await fetchCalendars();

        const me = await Cal.fetchMe();
        if (!me.success) throw new Error(me.message);
        const timeZone = me.data.data.timeZone;

        const schedules = await Cal.fetchSchedules();
        if (!schedules.success) throw new Error(schedules.message);
        const availability = schedules.data.data[0].availability;

        // Get availability window for the target date
        const availabilityResult = _.getAvailabilityWindow(targetDate, availability);
        if (!availabilityResult.success) return availabilityResult;

        const startDate = new Date(`${targetDate}T00:00:00`);
        const endDate = new Date(`${targetDate}T23:59:59`);

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

        return {
            success: true,
            data: {
                availabilityWindow: { ...availabilityResult.data },
                busyTimes,
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

const checkCalendar = async () => {
    try {
        const targetDate = "2025-05-20";

        // const cityLookup = cityTimezones.findFromCityStateProvince("Aurora CO");
        // console.log(cityLookup);

        const busyTimes = await fetchBusyTimes({ targetDate });

        console.log(busyTimes);
    } catch (error) {
        console.error("Main execution error:", error);
    }
};

const createBooking = async () => {
    try {
        // Create booking on 2025-05-21
        const bookingDate = "2025-05-21";
        const timeZone = "America/Denver";
        const startTime = "09:00";

        // Create a zoned time for 9:00 AM Denver time
        const localtime = toZonedTime(new Date(`${bookingDate}T${startTime}:00`), timeZone);

        // Convert to UTC ISO string
        const startTimeUTC = localtime.toISOString();

        const bookingData = {
            start: startTimeUTC,
            attendee: {
                name: "Ryan Roman",
                email: "rtroman14@gmail.com",
                timeZone: timeZone,
            },
            // eventTypeSlug: "30min",
            // username: "webagent",
            eventTypeId: 2485287,
            metadata: {
                summary: "",
            },
        };

        console.log("Attempting to book meeting for:", startTimeUTC);
        const response = await Cal.createBooking(bookingData);

        console.log("Booking response:", response);
    } catch (error) {
        console.error("Error creating booking:", error);
    }
};

// createBooking();

checkCalendar();
