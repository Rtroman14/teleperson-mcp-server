import TelepersonAPIs from "../src/teleperson-apis.js";

(async () => {
    try {
        const vendors = await TelepersonAPIs.vendorLounge("jesse@teleperson.com");

        console.log(`vendors -->`, vendors);
    } catch (error) {
        console.error(error);
    }
})();
