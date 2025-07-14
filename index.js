import express from "express";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

import { server as bookingServer } from "./src/booking.js";
import { server as websiteServer } from "./src/website.js";
import { server as salesTextServer } from "./src/sales.text.js";
import { server as salesVoiceServer } from "./src/sales.voice.js";

const app = express();

// https://www.npmjs.com/package/company-email-validator

let bookingTransport;
let websiteTransport;

let salesTextTransport;
let salesVoiceTransport;

let vendorTransport;

app.get("/sales/text/sse", async (req, res) => {
    salesTextTransport = new SSEServerTransport("/sales/text", res);
    await salesTextServer.connect(salesTextTransport);
});

app.post("/sales/text", async (req, res) => {
    await salesTextTransport.handlePostMessage(req, res);
});

app.get("/sales/voice/sse", async (req, res) => {
    salesVoiceTransport = new SSEServerTransport("/sales/voice", res);
    await salesVoiceServer.connect(salesVoiceTransport);
});

app.post("/sales/voice", async (req, res) => {
    await salesVoiceTransport.handlePostMessage(req, res);
});

app.get("/vendor/sse", async (req, res) => {
    vendorTransport = new SSEServerTransport("/vendor", res);
    await vendorServer.connect(vendorTransport);
});

app.post("/vendor", async (req, res) => {
    await vendorTransport.handlePostMessage(req, res);
});

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
