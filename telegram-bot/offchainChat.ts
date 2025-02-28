// services/oraAgent.ts
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export class OraAgentService {
  private apiKey: string;
  private registerHash: string;
  private contractAddress: string;
  
  constructor() {
    // Get the API key from environment variables
    this.apiKey = process.env.ORA_API_KEY || "";
    if (!this.apiKey) {
      throw new Error("ORA_API_KEY not found in environment variables.");
    }
    
    // Use config values
    this.registerHash = "0xcb9c56bb806304150c1dfc87f8f0048462e50f5276771b453e34cba450f18aae";
    this.contractAddress = "0x28f87aE396812D70E40Dd1f6a10Ed4FD233688D3";
  }
  
  async sendPrompt(prompt: string) {
    if (!prompt) {
      throw new Error("Prompt cannot be empty");
    }
    
    // Prepare the request payload - keep it simple like the example
    const payload = {
      model: "ora/opagent",
      messages: [{ role: "user", content: prompt }],
      registerHash: this.registerHash,
      contractAddress: this.contractAddress
    };
    
    try {
      // Log the request for debugging
      console.log("Sending request to Ora API:", {
        url: "https://api.ora.io/v1/agents/chat",
        payload
      });
      
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
      
      // Log the response for debugging
      console.log("API Response:", response.data);
      
      return {
        message: response.data.choices?.[0]?.message?.content || response.data.response || response.data,
        toolCalls: []
      };
      
    } catch (error: any) {
      console.error("Error calling Ora API:", error.response?.data || error.message);
      throw error;
    }
  }
}
