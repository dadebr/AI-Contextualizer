import { NextRequest, NextResponse } from 'next/server';
import { performAiAction } from '@/app/actions';

export async function POST(request: NextRequest) {
  try {
    const { action, text, targetLanguage } = await request.json();

    if (!action || !text) {
      return NextResponse.json(
        { error: 'Ação e texto são obrigatórios' },
        { status: 400 }
      );
    }

    console.log(`Processando ação: ${action} para texto: ${text.substring(0, 100)}...`);

    const result = await performAiAction(action, text, targetLanguage);

    if (result.error) {
      console.error('Erro ao processar ação:', result.error);
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    console.log('Ação processada com sucesso');
    return NextResponse.json({
      success: true,
      result: result.result,
      action,
      originalText: text
    });

  } catch (error) {
    console.error('Erro interno do servidor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Configuração para permitir CORS da extensão
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
