import "dotenv/config";
import axios from "axios";
import { formatInTimeZone } from "date-fns-tz";

class Cal {
    constructor() {
        this.baseUrl = "https://api.cal.com/v2";
        this.apiKey = process.env.CAL_API_KEY_JESSE;
    }

    fetchMe = async () => {
        try {
            const response = await axios({
                method: "GET",
                url: `${this.baseUrl}/me`,
                headers: {
                    Authorization: this.apiKey,
                },
            });

            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            console.error("fetchMe() -->", error.message);
            return {
                success: false,
                message: error.message,
            };
        }
    };

    fetchCalendars = async () => {
        try {
            const response = await axios({
                method: "GET",
                url: `${this.baseUrl}/calendars`,
                headers: {
                    Authorization: this.apiKey,
                },
            });

            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            console.error("fetchCalendars() -->", error.message);
            return {
                success: false,
                message: error.message,
            };
        }
    };

    fetchEventTypes = async () => {
        try {
            const response = await axios({
                method: "GET",
                url: `${this.baseUrl}/event-types`,
                headers: {
                    Authorization: this.apiKey,
                },
            });

            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            console.error("fetchEventTypes() -->", error.message);
            return {
                success: false,
                message: error.message,
            };
        }
    };

    fetchBookings = async (params = {}) => {
        try {
            const response = await axios({
                method: "GET",
                url: `${this.baseUrl}/bookings`,
                headers: {
                    Authorization: this.apiKey,
                },
                params,
            });

            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            console.error("fetchBookings() -->", error.message);
            return {
                success: false,
                message: error.message,
            };
        }
    };

    createBooking = async (bookingData) => {
        try {
            const response = await axios({
                method: "POST",
                url: `${this.baseUrl}/bookings`,
                headers: {
                    Authorization: this.apiKey,
                    "Content-Type": "application/json",
                    "cal-api-version": "2024-08-13",
                },
                data: bookingData,
            });

            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            console.error("createBooking() -->", error.message);
            console.error("Error details:", error.response?.data || "No details available");
            return {
                success: false,
                message: error.message,
                details: error.response?.data,
            };
        }
    };

    fetchBusyTimes = async ({ loggedInUsersTz, dateFrom, dateTo, credentialId, externalId }) => {
        try {
            const response = await axios({
                method: "GET",
                url: `${this.baseUrl}/calendars/busy-times`,
                headers: {
                    Authorization: this.apiKey,
                },
                params: {
                    loggedInUsersTz,
                    dateFrom,
                    dateTo,
                    "calendarsToLoad[0][credentialId]": credentialId,
                    "calendarsToLoad[0][externalId]": externalId,
                },
            });

            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            console.error("fetchBusyTimes() -->", error.message);
            return {
                success: false,
                message: error.message,
            };
        }
    };

    convertBusyTimesToTimezone = (busyTimes, timezone = "America/Denver") => {
        try {
            const convertedTimes = busyTimes.map((busy) => {
                const utcStart = new Date(busy.start);
                const utcEnd = new Date(busy.end);

                return {
                    ...busy,
                    utcStart: busy.start,
                    utcEnd: busy.end,
                    start: utcStart.toLocaleString("en-US", { timeZone: timezone }),
                    end: utcEnd.toLocaleString("en-US", { timeZone: timezone }),
                    timezone,
                };
            });

            return {
                success: true,
                data: convertedTimes,
            };
        } catch (error) {
            console.error("convertBusyTimesToTimezone() -->", error.message);
            return {
                success: false,
                message: error.message,
            };
        }
    };

    formatBusyTimes = (busyTimes, timezone = "America/Denver") => {
        try {
            const formattedTimes = busyTimes.map((busy) => {
                const startDate = new Date(busy.start);
                const endDate = new Date(busy.end);

                return {
                    ...busy,
                    formattedDate: formatInTimeZone(startDate, timezone, "MMMM d, yyyy"),
                    formattedTime: `${formatInTimeZone(
                        startDate,
                        timezone,
                        "h:mm a"
                    )} - ${formatInTimeZone(endDate, timezone, "h:mm a")}`,
                    formattedDateTime:
                        formatInTimeZone(startDate, timezone, "MMMM d, yyyy h:mm a") +
                        " - " +
                        formatInTimeZone(endDate, timezone, "h:mm a"),
                    timezone,
                };
            });

            return {
                success: true,
                data: formattedTimes,
            };
        } catch (error) {
            console.error("formatBusyTimes() -->", error.message);
            return {
                success: false,
                message: error.message,
            };
        }
    };

    fetchSchedules = async () => {
        try {
            const response = await axios({
                method: "GET",
                url: `${this.baseUrl}/schedules`,
                headers: {
                    Authorization: this.apiKey,
                    "cal-api-version": "2024-06-11",
                },
            });

            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            console.error("fetchSchedules() -->", error.message);
            return {
                success: false,
                message: error.message,
            };
        }
    };

    fetchSlotsForDay = async ({ eventTypeId, date, timeZone }) => {
        try {
            // Validate required parameters
            if (!eventTypeId || !date) {
                throw new Error("eventTypeId and date parameters are required");
            }

            // Build query parameters
            const queryParams = {
                start: date,
                end: date,
                eventTypeId: eventTypeId,
            };

            // Add timeZone if provided
            if (timeZone) {
                queryParams.timeZone = timeZone;
            }

            const response = await axios({
                method: "GET",
                url: `${this.baseUrl}/slots`,
                headers: {
                    Authorization: this.apiKey,
                    "cal-api-version": "2024-09-04",
                },
                params: queryParams,
            });

            const slotsData = response.data.data;

            // Check if slotsData is empty or has no slots for the date
            if (!slotsData || Object.keys(slotsData).length === 0 || !slotsData[date]) {
                return {
                    success: true,
                    data: [],
                };
            }

            // Format the slots with readable times
            const formattedSlots = slotsData[date].map((slot) =>
                formatInTimeZone(new Date(slot.start), timeZone, "h:mm a")
            );

            return {
                success: true,
                data: formattedSlots,
            };
        } catch (error) {
            console.error("fetchSlotsForDay() -->", error.message);
            return {
                success: false,
                message: error.message,
                data: [],
            };
        }
    };
}

export default new Cal();
