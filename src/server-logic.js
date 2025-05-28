import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export const server = new McpServer({
    name: "WeatherToolServer",
    version: "1.0.0",
});

server.tool(
    "getWeather",
    "Get the weather for the user",
    {
        // Parameters schema using Zod (will be converted to JSON Schema for OpenAI)
        city: z.string().describe("The city to get the weather for"),
        unit: z.enum(["C", "F"]).describe("Temperature unit: C or F"),
    },
    // Tool execution function (stateless; returns a result object)
    async ({ city, unit }) => {
        // **Production note:** You can call a real weather API here (e.g., OpenWeatherMap)
        // using fetch/axios. For now, we'll simulate a response:
        const tempC = 24;
        const description = "Sunny";
        const temp = unit === "C" ? tempC : (tempC * 9) / 5 + 32;
        const unitSymbol = unit;
        // Return the result in OpenAI function-call compatible format:
        return {
            content: [
                {
                    type: "text",
                    text: `It is currently ${temp.toFixed(
                        1
                    )}°${unitSymbol} and ${description} in ${city}.`,
                },
            ],
        };
    }
);
