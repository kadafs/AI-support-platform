import * as cheerio from 'cheerio';
import { ScrapedPage } from '../types';

export class URLScraper {
    private maxPages: number;
    private visitedUrls = new Set<string>();
    private baseUrl: string = '';

    constructor(maxPages: number = 60) {
        this.maxPages = maxPages;
    }

    async scrapeWebsite(startUrl: string): Promise<ScrapedPage[]> {
        this.visitedUrls.clear();
        this.baseUrl = new URL(startUrl).origin;

        const pages: ScrapedPage[] = [];
        const queue = [startUrl];

        while (queue.length > 0 && pages.length < this.maxPages) {
            const url = queue.shift()!;

            if (this.visitedUrls.has(url)) continue;
            this.visitedUrls.add(url);

            try {
                const page = await this.scrapePage(url);
                if (page) {
                    pages.push(page);

                    // Add internal links to queue
                    for (const link of page.links) {
                        if (!this.visitedUrls.has(link) && pages.length + queue.length < this.maxPages) {
                            queue.push(link);
                        }
                    }
                }
            } catch (error) {
                console.error(`Error scraping ${url}:`, error);
            }
        }

        return pages;
    }

    async scrapePage(url: string): Promise<ScrapedPage | null> {
        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'SupportAI Bot/1.0 (https://supportai.com)',
                },
            });

            if (!response.ok) return null;

            const html = await response.text();
            const $ = cheerio.load(html);

            // Remove script, style, and other non-content elements
            $('script, style, nav, footer, header, aside, iframe, noscript').remove();

            // Extract title
            const title = $('title').text().trim() || $('h1').first().text().trim() || url;

            // Extract main content
            const content = this.extractContent($);

            // Extract internal links
            const links = this.extractLinks($, url);

            return {
                url,
                title,
                content,
                links,
            };
        } catch (error) {
            console.error(`Failed to scrape ${url}:`, error);
            return null;
        }
    }

    private extractContent($: cheerio.CheerioAPI): string {
        // Prioritize main content areas
        const contentSelectors = [
            'main',
            'article',
            '[role="main"]',
            '.content',
            '.main-content',
            '#content',
            '#main',
            '.post-content',
            '.entry-content',
        ];

        let content = '';

        for (const selector of contentSelectors) {
            const element = $(selector);
            if (element.length > 0) {
                content = element.text();
                break;
            }
        }

        // Fallback to body
        if (!content) {
            content = $('body').text();
        }

        // Clean up whitespace
        return content
            .replace(/\s+/g, ' ')
            .replace(/\n\s*\n/g, '\n')
            .trim();
    }

    private extractLinks($: cheerio.CheerioAPI, currentUrl: string): string[] {
        const links: string[] = [];
        const currentUrlObj = new URL(currentUrl);

        $('a[href]').each((_, element) => {
            try {
                const href = $(element).attr('href');
                if (!href) return;

                // Skip non-http links
                if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) {
                    return;
                }

                // Resolve relative URLs
                const absoluteUrl = new URL(href, currentUrl).href;
                const linkUrl = new URL(absoluteUrl);

                // Only include same-origin links
                if (linkUrl.origin !== this.baseUrl) return;

                // Skip common non-content URLs
                const skipPatterns = [
                    /\.(pdf|zip|doc|docx|xls|xlsx|ppt|pptx)$/i,
                    /\.(jpg|jpeg|png|gif|svg|webp|ico)$/i,
                    /\.(mp3|mp4|wav|avi|mov)$/i,
                    /\/login/i,
                    /\/logout/i,
                    /\/register/i,
                    /\/signup/i,
                    /\/signin/i,
                    /\/cart/i,
                    /\/checkout/i,
                    /\/account/i,
                    /\/admin/i,
                ];

                if (skipPatterns.some((pattern) => pattern.test(absoluteUrl))) {
                    return;
                }

                links.push(absoluteUrl);
            } catch (error) {
                // Invalid URL, skip
            }
        });

        return [...new Set(links)]; // Remove duplicates
    }

    /**
     * Chunk scraped content for embedding
     */
    chunkContent(content: string, maxChunkSize: number = 1000): string[] {
        const chunks: string[] = [];
        const sentences = content.split(/(?<=[.!?])\s+/);

        let currentChunk = '';

        for (const sentence of sentences) {
            if (currentChunk.length + sentence.length > maxChunkSize) {
                if (currentChunk) {
                    chunks.push(currentChunk.trim());
                }
                currentChunk = sentence;
            } else {
                currentChunk += ' ' + sentence;
            }
        }

        if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
        }

        return chunks;
    }
}
