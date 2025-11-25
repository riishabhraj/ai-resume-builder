import OpenAI from 'openai';

const openaiKey = process.env.OPENAI_API_KEY || '';

/**
 * Validates if OpenAI API key is properly configured
 * Checks for presence and that it starts with 'sk-' (OpenAI key format)
 */
const isOpenAIConfigured = 
  openaiKey.length > 0 && 
  openaiKey.startsWith('sk-');

/**
 * OpenAI client for generating embeddings
 * Returns null if API key is not properly configured
 */
const openai = isOpenAIConfigured ? new OpenAI({
  apiKey: openaiKey,
}) : null;

/**
 * Flag indicating whether OpenAI is available
 * Use this to conditionally enable features that depend on OpenAI embeddings
 */
export const hasOpenAI = !!openai;

/**
 * Generate embeddings for a given text using OpenAI's embedding model
 * @param text - The text to embed
 * @returns Array of numbers representing the embedding
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!openai) {
    throw new Error('OpenAI not configured. Set OPENAI_API_KEY to enable embeddings.');
  }

  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small', // Cheapest and fastest
      input: text.replace(/\n/g, ' '), // Clean newlines
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

/**
 * Generate embeddings for multiple texts in batch
 * @param texts - Array of texts to embed
 * @returns Array of embeddings
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (!openai) {
    throw new Error('OpenAI not configured. Set OPENAI_API_KEY to enable embeddings.');
  }

  try {
    const cleanedTexts = texts.map((text) => text.replace(/\n/g, ' '));
    
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: cleanedTexts,
    });

    return response.data.map((item) => item.embedding);
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw new Error('Failed to generate embeddings');
  }
}

/**
 * Calculate cosine similarity between two vectors
 * @param a - First vector
 * @param b - Second vector
 * @returns Similarity score between 0 and 1
 */
export function cosineSimilarity(a: number[], b: number[]): number {
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

