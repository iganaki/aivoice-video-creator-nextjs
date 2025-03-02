import { getAIVoiceTTS } from "@/lib/aivoice/tts";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import path from "path";
import fs from "fs/promises";

// リクエストスキーマの定義
const synthesizeRequestSchema = z.object({
  text: z.string().min(1).max(10000),
  voiceName: z.string().optional(),
});

// 音声合成APIハンドラ
export async function POST(req: NextRequest) {
  try {
    // リクエストの検証
    const body = await req.json();
    const result = synthesizeRequestSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: "不正なリクエスト", details: result.error.format() },
        { status: 400 }
      );
    }
    
    const { text, voiceName } = result.data;
    
    // AIVOICEのインスタンス取得
    const tts = getAIVoiceTTS();
    
    // 利用可能な話者を確認（オプション）
    if (voiceName) {
      const voices = await tts.getAvailableVoices();
      if (!voices || (!voices.standard.includes(voiceName) && !voices.presets.includes(voiceName))) {
        return NextResponse.json(
          { error: `指定された話者 '${voiceName}' は利用できません。` },
          { status: 400 }
        );
      }
    }
    
    // 音声合成
    const publicDir = path.join(process.cwd(), 'public');
    const audioDir = path.join(publicDir, 'audio');
    
    // ディレクトリがなければ作成
    try {
      await fs.mkdir(audioDir, { recursive: true });
    } catch (error) {
      console.error('音声ディレクトリの作成に失敗しました:', error);
      return NextResponse.json(
        { error: '内部サーバーエラー' },
        { status: 500 }
      );
    }
    
    // ファイル名の生成
    const fileName = `speech-${Date.now()}.wav`;
    const outputPath = path.join(audioDir, fileName);
    
    // 音声合成実行
    const filePath = await tts.synthesize(text, outputPath, voiceName);
    
    if (!filePath) {
      return NextResponse.json(
        { error: '音声合成に失敗しました。A.I.VOICE Editorが起動しているか確認してください。' },
        { status: 500 }
      );
    }
    
    // 相対パスを生成（/public配下のパス）
    const relativePath = `/audio/${fileName}`;
    
    // 成功レスポンス
    return NextResponse.json({
      success: true,
      audioUrl: relativePath,
      text: text,
      voice: await tts.getCurrentVoice() || voiceName || '不明',
    });
    
  } catch (error) {
    console.error('音声合成中にエラーが発生しました:', error);
    return NextResponse.json(
      { error: '内部サーバーエラー' },
      { status: 500 }
    );
  }
}

// 利用可能な話者を取得するAPIハンドラ
export async function GET() {
  try {
    const tts = getAIVoiceTTS();
    const voices = await tts.getAvailableVoices();
    
    if (!voices) {
      return NextResponse.json(
        { error: '話者リストの取得に失敗しました。A.I.VOICE Editorが起動しているか確認してください。' },
        { status: 500 }
      );
    }
    
    const currentVoice = await tts.getCurrentVoice();
    
    return NextResponse.json({
      success: true,
      voices: voices,
      currentVoice: currentVoice,
    });
    
  } catch (error) {
    console.error('話者リスト取得中にエラーが発生しました:', error);
    return NextResponse.json(
      { error: '内部サーバーエラー' },
      { status: 500 }
    );
  }
}
