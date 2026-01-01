import { parse } from 'csv-parse/sync';
import { URLScraper } from './url-scraper';
import { EmbeddingService } from '../embeddings';
import { KnowledgeChunk, ScrapedPage } from '../types';
import OpenAI from 'openai';

export interface IngestionResult {
    success: boolean;
    sourceId: string;
    chunks: number;
    error?: string;
}

export class KnowledgeIngester {
    private urlScraper: URLScraper;
    private embeddingService: EmbeddingService;

    constructor(openai: OpenAI) {
        this.urlScraper = new URLScraper(60);
        this.embeddingService = new EmbeddingService(openai);
    }

    /**
     * Ingest content from a URL
     */
    async ingestURL(
        sourceId: string,
        sourceName: string,
        url: string
    ): Promise<KnowledgeChunk[]> {
        const pages = await this.urlScraper.scrapeWebsite(url);
        const chunks: KnowledgeChunk[] = [];

        for (const page of pages) {
            const textChunks = this.urlScraper.chunkContent(page.content);

            for (let i = 0; i < textChunks.length; i++) {
                const content = textChunks[i];
                if (content.length < 50) continue; // Skip very short chunks

                const embedding = await this.embeddingService.createEmbedding(content);

                chunks.push({
                    content,
                    embedding,
                    metadata: {
                        sourceId,
                        sourceName: `${sourceName} - ${page.title}`,
                        sourceType: 'URL',
                        chunkIndex: i,
                    },
                });
            }
        }

        return chunks;
    }

    /**
     * Ingest Q&A pairs
     */
    async ingestQA(
        sourceId: string,
        sourceName: string,
        qaPairs: { question: string; answer: string }[]
    ): Promise<KnowledgeChunk[]> {
        const chunks: KnowledgeChunk[] = [];

        for (let i = 0; i < qaPairs.length; i++) {
            const { question, answer } = qaPairs[i];

            // Combine Q&A for better context
            const content = `Question: ${question}\n\nAnswer: ${answer}`;
            const embedding = await this.embeddingService.createEmbedding(content);

            chunks.push({
                content,
                embedding,
                metadata: {
                    sourceId,
                    sourceName,
                    sourceType: 'QA',
                    chunkIndex: i,
                },
            });
        }

        return chunks;
    }

    /**
     * Ingest CSV file content
     */
    async ingestCSV(
        sourceId: string,
        sourceName: string,
        csvContent: string,
        options?: {
            questionColumn?: string;
            answerColumn?: string;
            contentColumn?: string;
        }
    ): Promise<KnowledgeChunk[]> {
        const records = parse(csvContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        });

        const chunks: KnowledgeChunk[] = [];
        const { questionColumn, answerColumn, contentColumn } = options || {};

        for (let i = 0; i < records.length; i++) {
            const record = records[i];
            let content: string;

            if (questionColumn && answerColumn && record[questionColumn] && record[answerColumn]) {
                // Q&A format
                content = `Question: ${record[questionColumn]}\n\nAnswer: ${record[answerColumn]}`;
            } else if (contentColumn && record[contentColumn]) {
                // Single content column
                content = record[contentColumn];
            } else {
                // Fallback: combine all columns
                content = Object.entries(record)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join('\n');
            }

            if (content.length < 20) continue;

            const embedding = await this.embeddingService.createEmbedding(content);

            chunks.push({
                content,
                embedding,
                metadata: {
                    sourceId,
                    sourceName,
                    sourceType: 'CSV',
                    chunkIndex: i,
                },
            });
        }

        return chunks;
    }

    /**
     * Ingest manual text content
     */
    async ingestText(
        sourceId: string,
        sourceName: string,
        text: string
    ): Promise<KnowledgeChunk[]> {
        const textChunks = this.chunkText(text);
        const chunks: KnowledgeChunk[] = [];

        for (let i = 0; i < textChunks.length; i++) {
            const content = textChunks[i];
            if (content.length < 50) continue;

            const embedding = await this.embeddingService.createEmbedding(content);

            chunks.push({
                content,
                embedding,
                metadata: {
                    sourceId,
                    sourceName,
                    sourceType: 'MANUAL',
                    chunkIndex: i,
                },
            });
        }

        return chunks;
    }

    private chunkText(text: string, maxChunkSize: number = 1000): string[] {
        const paragraphs = text.split(/\n\s*\n/);
        const chunks: string[] = [];
        let currentChunk = '';

        for (const paragraph of paragraphs) {
            if (currentChunk.length + paragraph.length > maxChunkSize) {
                if (currentChunk) {
                    chunks.push(currentChunk.trim());
                }
                currentChunk = paragraph;
            } else {
                currentChunk += '\n\n' + paragraph;
            }
        }

        if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
        }

        return chunks;
    }
}
