import { getAIVoiceTTS } from "@/lib/aivoice/tts";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// リクエストスキーマの定義
const setVoiceRequestSchema = z.object({
  voiceName: z.string().min(1),
});

// 話者設定APIハンドラ
export async function POST(req: NextRequest) {
  try {
    // リクエストの検証
    const body = await req.json();
    const result = setVoiceRequestSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: "不正なリクエスト", details: result.error.format() },
        { status: 400 }
      );
    }
    
    const { voiceName } = result.data;
    
    // AIVOICEのインスタンス取得
    const tts = getAIVoiceTTS();
    
    // 話者を設定
    const success = await tts.setVoice(voiceName);
    
    if (!success) {
      return NextResponse.json(
        { error: `指定された話者 '${voiceName}' は利用できません。` },
        { status: 400 }
      );
    }
    
    // 現在の話者を取得
    const currentVoice = await tts.getCurrentVoice();
    
    // 成功レスポンス
    return NextResponse.json({
      success: true,
      voice: currentVoice,
    });
    
  } catch (error) {
    console.error('話者設定中にエラーが発生しました:', error);
    return NextResponse.json(
      { error: '内部サーバーエラー' },
      { status: 500 }
    );
  }
}

// 現在の話者を取得するAPIハンドラ
export async function GET() {
  try {
    const tts = getAIVoiceTTS();
    const currentVoice = await tts.getCurrentVoice();
    
    if (!currentVoice) {
      return NextResponse.json(
        { error: '現在の話者の取得に失敗しました。A.I.VOICE Editorが起動しているか確認してください。' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      voice: currentVoice,
    });
    
  } catch (error) {
    console.error('現在の話者取得中にエラーが発生しました:', error);
    return NextResponse.json(
      { error: '内部サーバーエラー' },
      { status: 500 }
    );
  }
}
