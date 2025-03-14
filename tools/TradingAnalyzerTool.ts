import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import LLMTradingAnalyzer from "./twitter/llm-analyzer";

export function createTradingAnalyzerTool(analyzer: LLMTradingAnalyzer) {
    return new DynamicStructuredTool({
        name: "analyze_crypto_sentiment",
        description: "Analyzes Twitter sentiment for a cryptocurrency and provides trading recommendations",
        schema: z.object({
            cryptoSymbol: z.string().describe("The cryptocurrency symbol (e.g., BTC, ETH, SOL)"),
            query: z.string().describe("The Twitter search query to analyze"),
            totalTweets: z.number().optional().describe("Total number of tweets analyzed"),
            totalCryptoTweets: z.number().optional().describe("Number of crypto-related tweets"),
            positiveCount: z.number().optional().describe("Number of potentially positive tweets"),
            hashtags: z.array(z.string()).optional().describe("Top hashtags found in the tweets")
        }),
        func: async ({ cryptoSymbol, query, totalTweets = 1000, totalCryptoTweets = 800, positiveCount = 500, hashtags = ["#crypto"] }) => {
            // ScraperResult object from the inputs
            const scraperResult = {
                query,
                totalTweets,
                analysis: {
                    totalCryptoTweets,
                    potentiallyPositiveTweets: positiveCount,
                    topHashtags: hashtags
                }
            };

            // analyzer to get a recommendation
            const recommendation = await analyzer.analyzeTradingDecision(scraperResult, cryptoSymbol);

            // Return the recommendation as a formatted string
            return JSON.stringify(recommendation, null, 2);
        }
    });
}
