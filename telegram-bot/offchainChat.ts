// services/oraAgent.ts
import axios from "axios";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

interface OraAgentConfig {
  registerHash: string;
  contractAddress: string;
}

export class OraAgentService {
  private apiKey: string;
  private config: OraAgentConfig;
  
  constructor(configFilePath: string = "config/deploy-config.json") {
    // Get the API key from environment variables
    this.apiKey = process.env.ORA_API_KEY || "";
    if (!this.apiKey) {
      throw new Error("ORA_API_KEY not found in environment variables.");
    }
    
    // Read config file
    this.config = this.readConfig(configFilePath);
  }
  
  private readConfig(configFilePath: string): OraAgentConfig {
    if (!fs.existsSync(configFilePath)) {
      throw new Error(`Config file not found at ${configFilePath}`);
    }
    const configRaw = fs.readFileSync(configFilePath, "utf8");
    return JSON.parse(configRaw);
  }
  
  async sendPrompt(prompt: string) {
    if (!prompt) {
      throw new Error("Prompt cannot be empty");
    }
    
    // Prepare the request payload
    const payload = {
      model: "ora/opagent",
      messages: [{ role: "user", content: prompt }],
      registerHash: this.config.registerHash,
      contractAddress: this.config.contractAddress
    };
    
    try {
      const response = await axios.post(
        "https://api.ora.io/v1/agents/chat",
        payload,
        {
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      return {
        message: response.data.choices[0].message.content,
        toolCalls: response.data.tool_calls
      };
    } catch (error) {
      console.error("Error sending request to Ora API:", error);
      throw error;
    }
  }
}
