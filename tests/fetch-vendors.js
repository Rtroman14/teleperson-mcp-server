import TelepersonAPIs from "../src/teleperson-apis.js";

// const email = "jesse@teleperson.com";
const email = "ryan@webagent.ai";

(async () => {
    try {
        const vendors = await TelepersonAPIs.allVendors(email);

        console.log(`vendors -->`, vendors);
    } catch (error) {
        console.error(error);
    }
})();
