import Cal from "../src/Cal.js";
import { format } from "date-fns";

const JESSE_EVENT_TYPE_ID = 2512300;

const start = "2025-06-11";
const end = "2025-06-11";
const timeZone = "America/Denver";

(async () => {
    try {
        const result = await Cal.fetchSlotsBetweenDates({
            eventTypeId: JESSE_EVENT_TYPE_ID,
            start,
            end,
            timeZone: timeZone,
        });

        const formattedStart = format(new Date(start), "PPPP");
        const formattedEnd = format(new Date(end), "PPPP");

        let resultText = `There are no available time slots between ${formattedStart} - ${formattedEnd}`;

        if (result.success && result.data && Object.values(result.data).flat().length) {
            resultText = `Here are the available time slots between ${formattedStart} - ${formattedEnd}: ${JSON.stringify(
                result.data,
                null,
                4
            )}`;
        }

        console.log(resultText);

        console.log("Slots result:", result);
    } catch (error) {
        console.error(error);
    }
})();
