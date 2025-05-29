import { format } from "date-fns";
import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";

class Helpers {
    getAvailabilityWindow({ targetDate, availability, calendarOwnerTimeZone, userTimeZone }) {
        // Get day of week from target date
        const dayOfWeek = format(new Date(targetDate), "EEEE");

        // Find matching availability window
        const availabilityWindow = availability.find((window) => window.days.includes(dayOfWeek));

        if (!availabilityWindow) {
            return {
                success: false,
                message: `No availability window found for ${dayOfWeek}`,
            };
        }

        // Create date objects for start and end times on the target date in calendar owner's timezone
        const startDateTime = fromZonedTime(
            new Date(`${targetDate}T${availabilityWindow.startTime}:00`),
            calendarOwnerTimeZone
        );
        const endDateTime = fromZonedTime(
            new Date(`${targetDate}T${availabilityWindow.endTime}:00`),
            calendarOwnerTimeZone
        );

        // Convert to user's timezone and format
        const startTimeLocal = formatInTimeZone(startDateTime, userTimeZone, "h:mm a");
        const endTimeLocal = formatInTimeZone(endDateTime, userTimeZone, "h:mm a");

        return {
            success: true,
            data: {
                startTime: availabilityWindow.startTime,
                endTime: availabilityWindow.endTime,
                startTimeLocal,
                endTimeLocal,
            },
        };
    }
}

export default new Helpers();
