import express from "express";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

// import { server } from "./server-logic.js";
import { server } from "./booking.js";

const app = express();

let transport;
app.get("/sse", async (req, res) => {
    transport = new SSEServerTransport("/booking", res);
    await server.connect(transport);
});

app.post("/booking", async (req, res) => {
    await transport.handlePostMessage(req, res);
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`✅ MCP server listening on port ${PORT}`);
});
