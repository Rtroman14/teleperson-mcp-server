import { format } from "date-fns";

class Helpers {
    getAvailabilityWindow(targetDate, availability) {
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

        return {
            success: true,
            data: {
                startTime: availabilityWindow.startTime,
                endTime: availabilityWindow.endTime,
            },
        };
    }
}

export default new Helpers();
