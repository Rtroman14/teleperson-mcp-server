import Cal from "../src/Cal.js";

(async () => {
    try {
        const calendars = await Cal.fetchCalendars();
        console.log(`calendars -->`, calendars.data.data);
    } catch (error) {
        console.error(error);
    }
})();
