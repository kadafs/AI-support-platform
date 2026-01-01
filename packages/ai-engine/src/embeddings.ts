import OpenAI from 'openai';

export class EmbeddingService {
    private openai: OpenAI;
    private model = 'text-embedding-3-small';

    constructor(openai: OpenAI) {
        this.openai = openai;
    }

    async createEmbedding(text: string): Promise<number[]> {
        const response = await this.openai.embeddings.create({
            model: this.model,
            input: this.truncateText(text, 8000),
        });

        return response.data[0].embedding;
    }

    async createEmbeddings(texts: string[]): Promise<number[][]> {
        const truncatedTexts = texts.map((t) => this.truncateText(t, 8000));

        const response = await this.openai.embeddings.create({
            model: this.model,
            input: truncatedTexts,
        });

        return response.data.map((d) => d.embedding);
    }

    /**
     * Calculate cosine similarity between two vectors
     */
    cosineSimilarity(a: number[], b: number[]): number {
        if (a.length !== b.length) {
            throw new Error('Vectors must have the same length');
        }

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /**
     * Find most similar chunks to a query
     */
    findSimilar(
        queryEmbedding: number[],
        embeddings: { id: string; embedding: number[]; content: string; name: string }[],
        topK: number = 5
    ): { id: string; content: string; name: string; similarity: number }[] {
        const similarities = embeddings.map((item) => ({
            id: item.id,
            content: item.content,
            name: item.name,
            similarity: this.cosineSimilarity(queryEmbedding, item.embedding),
        }));

        return similarities
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, topK);
    }

    private truncateText(text: string, maxTokens: number): string {
        // Rough estimation: 1 token ≈ 4 characters
        const maxChars = maxTokens * 4;
        if (text.length <= maxChars) return text;
        return text.substring(0, maxChars);
    }
}
