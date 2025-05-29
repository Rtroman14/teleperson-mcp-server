import Cal from "../src/Cal.js";
import { format } from "date-fns";

const JESSE_EVENT_TYPE_ID = 2512300;

// const date = "2025-05-30";
const date = "2025-06-11";
const timeZone = "America/Denver";

(async () => {
    try {
        const result = await Cal.fetchSlotsForDay({
            eventTypeId: JESSE_EVENT_TYPE_ID,
            date,
            timeZone: timeZone,
        });

        const formattedDate = format(new Date(date), "PPPP");
        let resultText = `There are no available time slots for this day (${formattedDate})`;

        if (result.success && result.data.length) {
            resultText = `Here are the available time slots for ${formattedDate}: ${result.data.join(
                ", "
            )}`;
        }

        console.log(resultText);

        console.log("Slots result:", result);
    } catch (error) {
        console.error(error);
    }
})();
