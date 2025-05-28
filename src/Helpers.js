import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

class Helpers {
    getAvailabilityWindow({ targetDate, availability, timeZone }) {
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

        // Create date objects for start and end times on the target date
        const startDateTime = new Date(`${targetDate}T${availabilityWindow.startTime}:00`);
        const endDateTime = new Date(`${targetDate}T${availabilityWindow.endTime}:00`);

        // Format times in user's timezone with h:mm a format
        const startTimeLocal = formatInTimeZone(startDateTime, timeZone, "h:mm a");
        const endTimeLocal = formatInTimeZone(endDateTime, timeZone, "h:mm a");

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
