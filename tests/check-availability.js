import checkAvailability from "../src/check-availability.js";

const date = "2025-05-29";

(async () => {
    try {
        const result = await checkAvailability(date);

        console.log(result);
    } catch (error) {
        console.error(error);
    }
})();
