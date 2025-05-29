import checkAvailability from "../src/check-availability.js";

const date = "2025-05-30";

const userTimeZone = "America/Denver";
// const userTimeZone = "America/Chicago";

(async () => {
    try {
        const result = await checkAvailability(date, userTimeZone);

        console.log(result);
    } catch (error) {
        console.error(error);
    }
})();
