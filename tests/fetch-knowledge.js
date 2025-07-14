import "dotenv/config";

import { knowledgeRetrieval } from "../src/knowledge-retrieval.js";

const question = "What is Teleperson?";

(async () => {
    try {
        const res = await knowledgeRetrieval({ question, vendorName: "Teleperson" });
        console.log(`res -->`, res);
    } catch (error) {
        console.error(error);
    }
})();
