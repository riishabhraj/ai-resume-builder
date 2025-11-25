import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateEmbeddings } from '@/lib/embeddings';
import { atsKnowledgeBase } from '@/lib/ats-knowledge-base';

/**
 * API route to populate the ATS knowledge base with embeddings
 * This should be run once to initialize the vector database
 * Protected by API key to prevent unauthorized access
 */
export async function POST(request: NextRequest) {
  try {
    // Check for admin API key
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 503 }
      );
    }

    console.log('Starting knowledge base setup...');
    console.log(`Processing ${atsKnowledgeBase.length} documents`);

    // Generate embeddings for all documents
    const contents = atsKnowledgeBase.map((doc) => doc.content);
    console.log('Generating embeddings...');
    
    const embeddings = await generateEmbeddings(contents);
    console.log('Embeddings generated successfully');

    // Prepare data for insertion
    const documentsWithEmbeddings = atsKnowledgeBase.map((doc, index) => ({
      id: doc.id,
      type: doc.type,
      content: doc.content,
      embedding: embeddings[index],
      metadata: doc.metadata,
    }));

    // Insert into Supabase (upsert to handle re-runs)
    console.log('Inserting documents into database...');
    
    const { data, error } = await supabaseAdmin
      .from('ats_knowledge')
      .upsert(documentsWithEmbeddings, {
        onConflict: 'id',
      });

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log('Knowledge base setup completed successfully');

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${atsKnowledgeBase.length} documents`,
      documentsProcessed: atsKnowledgeBase.length,
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      {
        error: 'Failed to setup knowledge base',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check knowledge base status
 */
export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 503 }
      );
    }

    const { count, error } = await supabaseAdmin
      .from('ats_knowledge')
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      totalDocuments: count || 0,
      expectedDocuments: atsKnowledgeBase.length,
      isSetup: count === atsKnowledgeBase.length,
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      {
        error: 'Failed to check status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

