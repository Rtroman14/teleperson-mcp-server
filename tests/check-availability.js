import checkAvailability from "../src/check-availability.js";

const date = "2025-05-29";

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

const americaDenver = {
    text: 'Available hours: 9:00 AM - 3:00 PM. The user is busy during these times: [{"busy":"9:00 AM - 9:30 AM"},{"busy":"12:00 PM - 1:00 PM"}]',
    availabilityWindow: {
        startTime: "09:00",
        endTime: "15:00",
        startTimeLocal: "9:00 AM",
        endTimeLocal: "3:00 PM",
    },
    busyTimes: [
        {
            busy: "9:00 AM - 9:30 AM",
        },
        {
            busy: "12:00 PM - 1:00 PM",
        },
    ],
};

const americaChicago = {
    text: 'Available hours: 10:00 AM - 4:00 PM. The user is busy during these times: [{"busy":"10:00 AM - 10:30 AM"},{"busy":"1:00 PM - 2:00 PM"}]',
    availabilityWindow: {
        startTime: "09:00",
        endTime: "15:00",
        startTimeLocal: "10:00 AM",
        endTimeLocal: "4:00 PM",
    },
    busyTimes: [
        {
            busy: "10:00 AM - 10:30 AM",
        },
        {
            busy: "1:00 PM - 2:00 PM",
        },
    ],
};
