import TelepersonAPIs from "../src/teleperson-apis.js";

(async () => {
    try {
        const transactions = await TelepersonAPIs.fetchTransactions("jesse@teleperson.com");

        console.log(`transactions -->`, transactions);
    } catch (error) {
        console.error(error);
    }
})();
