// sendRequest.ts
import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Load environment variables from .env file
dotenv.config();

// Path to config.json (can be modified based on your file structure)
const configFilePath = "config/deploy-config.json";

// Helper function to read configuration
function readConfig() {
  if (!fs.existsSync(configFilePath)) {
    throw new Error("Config file not found.");
  }
  const configRaw = fs.readFileSync(configFilePath, "utf8");
  return JSON.parse(configRaw);
}

async function sendChatRequest() {
  // Get prompt from environment variable
  const prompt = process.env.PROMPT;
  if (!prompt) {
    console.error("Please set the PROMPT environment variable.");
    process.exit(1);
  }

  // Read config for contract address and register hash
  const config = readConfig();
  const registerHash = config.registerHash;
  const contractAddress = config.opAgentContract;

  // Get the API key from environment variables
  const oraApiKey = process.env.ORA_API_KEY;
  if (!oraApiKey) {
    console.error("ORA_API_KEY not found in environment variables.");
    process.exit(1);
  }

  // Prepare the request payload
  const payload = {
    model: "ora/opagent",
    messages: [{ role: "user", content: prompt }],
    registerHash: registerHash,
    contractAddress: contractAddress
  };

  // Send the POST request to the API
  try {
    const response = await axios.post(
      "https://api.ora.io/v1/agents/chat",
      payload,
      {
        headers: {
          "Authorization": `Bearer ${oraApiKey}`,
          "Content-Type": "application/json"
        }
      }
    );

    // Log the response
    console.log("messages:", response.data.choices[0].message.content);
    console.log("function call:", response.data.tool_calls);
  } catch (error) {
    console.error("Error sending request:", error);
    process.exit(1);
  }
}

// Run the function to send the request
sendChatRequest().catch((error) => {
  console.error("Error in sending request:", error);
  process.exit(1);
});
