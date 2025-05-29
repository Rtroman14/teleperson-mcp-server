import Cal from "./Cal.js";
import { fromZonedTime } from "date-fns-tz";

const RYAN_EVENT_TYPE_ID = 2485287;
const JESSE_EVENT_TYPE_ID = 2512300;

const createBooking = async (
    date,
    startTime,
    timeZone,
    attendeeName,
    attendeeEmail,
    summary = ""
) => {
    try {
        // Create a zoned time for the meeting
        const localtime = fromZonedTime(new Date(`${date}T${startTime}:00`), timeZone);

        // Convert to UTC ISO string
        const startTimeUTC = localtime.toISOString();

        console.log(
            `Booking conversion: ${date}T${startTime}:00 in ${timeZone} -> ${startTimeUTC}`
        );

        const bookingData = {
            start: startTimeUTC,
            attendee: {
                name: attendeeName,
                email: attendeeEmail,
                timeZone: timeZone,
            },
            eventTypeId: JESSE_EVENT_TYPE_ID,
            metadata: {
                summary: summary,
            },
        };

        const response = await Cal.createBooking(bookingData);

        if (!response.success) {
            throw new Error(response.message || "Failed to create booking");
        }

        return {
            success: true,
            message: `Booking created successfully for ${attendeeName} on ${date} at ${startTime}.`,
            data: response.data,
        };
    } catch (error) {
        console.error("createBooking: ", error);
        return {
            success: false,
            message: error.message,
        };
    }
};

export default createBooking;
