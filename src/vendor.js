import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import _ from "./Helpers.js";
import TelepersonAPIs from "./teleperson-apis.js";
// import { knowledgeRetrieval } from "./knowledge-retrieval.js";

export const server = new McpServer({
    name: "VendorToolServer",
    version: "1.0.0",
});

// server.tool(
//     "get_information",
//     "Retrieve detailed information from your knowledge base for vendor-specific queries.",
//     {
//         question: z.string().describe("the user's question"),
//         vendorName: z.string().describe("the name of the vendor the user is asking about"),
//     },
//     async ({ question }) => {
//         const result = await knowledgeRetrieval({ question, vendorName });

//         if (!result.success) {
//             return {
//                 content: [
//                     {
//                         type: "text",
//                         text: `Error: ${result.message}`,
//                     },
//                 ],
//             };
//         }

//         return {
//             content: [
//                 {
//                     type: "text",
//                     text: result.data,
//                 },
//             ],
//         };
//     }
// );

server.tool(
    "get_users_vendors",
    "Retrieve all vendors from a user's vendor hub and vendor lounge.",
    {
        email: z.string().describe("The user's email"),
    },
    async ({ email }) => {
        const result = await TelepersonAPIs.allVendors(email);

        if (!result.success) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error fetching vendors: ${result.message || "Unknown error"}`,
                    },
                ],
            };
        }

        const { hub, lounge } = result.data;
        const message = `
Vendor Hub (${hub.numVendors} vendors):
<vendorHub>
${JSON.stringify(hub.vendorNameAndDescriptions, null, 4)}
</vendorHub>

Vendor Lounge (${lounge.numVendors} vendors):
<vendorLounge>
${JSON.stringify(lounge.vendorNameAndDescriptions, null, 4)}
</vendorLounge>
`;

        return {
            content: [
                {
                    type: "text",
                    text: message,
                },
            ],
        };
    }
);

server.tool(
    "get_users_transactions",
    "Get a list of the user's recent transactions.",
    {
        email: z.string().describe("The user's email"),
    },
    async ({ email }) => {
        const result = await TelepersonAPIs.fetchTransactions(email);

        if (!result.success) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error: ${result.message}`,
                    },
                ],
            };
        }

        const message = `
        <transactions>
        ${JSON.stringify(result.data, null, 4)}
        </transactions>`;

        return {
            content: [
                {
                    type: "text",
                    text: message,
                },
            ],
        };
    }
);
