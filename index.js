import express from "express";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

import { server as bookingServer } from "./booking.js";
import { server as websiteServer } from "./website.js";

const app = express();

// https://www.npmjs.com/package/company-email-validator

let bookingTransport;
let websiteTransport;

app.get("/booking/sse", async (req, res) => {
    bookingTransport = new SSEServerTransport("/booking", res);
    await bookingServer.connect(bookingTransport);
});

app.post("/booking", async (req, res) => {
    await bookingTransport.handlePostMessage(req, res);
});

app.get("/website/sse", async (req, res) => {
    websiteTransport = new SSEServerTransport("/website", res);
    await websiteServer.connect(websiteTransport);
});

app.post("/website", async (req, res) => {
    await websiteTransport.handlePostMessage(req, res);
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`✅ MCP server listening on port ${PORT}`);
});
