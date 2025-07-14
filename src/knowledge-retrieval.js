import "dotenv/config";

import { pipeline } from "@xenova/transformers";
import { createClient } from "@supabase/supabase-js";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

export const findRelevantContent = async ({ supabase, question, vendorName }) => {
    try {
        // Get embeddings for the question
        const pipe = await pipeline("feature-extraction", "Supabase/gte-small");
        const output = await pipe(question, {
            pooling: "mean",
            normalize: true,
        });
        const embedding = Array.from(output.data);

        // Query matching documents
        const { data: documents, error } = await supabase.rpc("match_documents_by_vendor_name", {
            query_embedding: embedding,
            match_threshold: 0.83,
            match_count: 8,
            vendor_name_param: vendorName,
        });

        if (error) throw error;

        if (!documents?.length) {
            return {
                content: "",
                sources: [],
                messageSources: [],
            };
        }

        // Deduplicate sources by URL and sort by similarity
        const uniqueDocuments = documents
            .reduce((acc, doc) => {
                // Skip documents without URLs
                if (!doc.metadata.source) return acc;

                // Check if we already have a document with this URL
                const existingDoc = acc.find((d) => d.metadata.source === doc.metadata.source);

                // If no existing doc or current doc has higher similarity, use current doc
                if (!existingDoc || doc.similarity > existingDoc.similarity) {
                    // Remove existing doc if present
                    const filtered = acc.filter((d) => d.metadata.source !== doc.metadata.source);
                    return [...filtered, doc];
                }

                return acc;
            }, [])
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 3); // Limit to top 3 sources

        return {
            content: documents.map((doc) => doc.content).join("\n\n"),
            sources: uniqueDocuments.map((doc) => ({
                url: doc.metadata.source,
                title: doc?.metadata?.title || doc.metadata.source,
            })),
            messageSources: documents
                .map((doc) => ({
                    document_id: doc.id,
                    similarity: Number(doc.similarity.toFixed(2)),
                }))
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, 6),
        };
    } catch (error) {
        console.error("findRelevantContent error:", error);
        return { content: "", sources: [], messageSources: [] };
    }
};

export const knowledgeRetrieval = async ({ question, vendorName = "Teleperson" }) => {
    try {
        const supabase = await createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY
        );
        const knowledgeBase = await findRelevantContent({
            supabase,
            question,
            vendorName,
        });

        if (knowledgeBase.content !== "") {
            const google = createGoogleGenerativeAI({
                apiKey: process.env.GOOGLE_AI_API_KEY,
            });

            const { text } = await generateText({
                model: google("gemini-2.0-flash-001"),
                maxTokens: 1500,
                temperature: 0.3,
                system: `
You are a content extraction assistant for teleperson-related queries. Provide detailed and comprehensive information that directly pertains to the user's question.
- Include all relevant details without introducing unnecessary verbosity.
`,
                prompt: `
User's Question:
"""${question}"""

Knowledge Base Content:
"""${knowledgeBase.content}"""

Please extract and return only the relevant and detailed information from the provided knowledge base that's pertinent to the user's question.
            `,
            });

            return {
                success: true,
                data: `Knowledge base: <knowledge>${knowledgeBase.content}</knowledge> \n\n<verifiedAnswer>${text}</verifiedAnswer>`,
            };
        }

        return {
            success: true,
            data: knowledgeBase.content,
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: "There was an error",
        };
    }
};
