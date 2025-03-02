/**
 * AIVOICEとの連携を行うためのライブラリ
 * 
 * このファイルはNode.js環境で実行されることを前提としています。
 * Next.jsのAPI Routeやサーバーアクションから呼び出されます。
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { randomUUID } from 'crypto';

// winaxはNode.jsからWindowsのCOMオブジェクトを操作するためのライブラリ
let winax: any;

/**
 * winaxの初期化を行う
 * winaxはWindowsでしか動作しないため、動的にインポートする
 */
async function initWinax() {
  if (!winax) {
    try {
      // 動的インポート
      winax = (await import('winax')).default;
    } catch (error) {
      console.error('winaxのインポートに失敗しました:', error);
      throw new Error('winaxのインポートに失敗しました。Windowsで実行されていることを確認してください。');
    }
  }
  return winax;
}

/**
 * AIVoice TTSクラス
 * AIVOICEエディタと連携してテキストを音声に変換する
 */
export class AIVoiceTTS {
  private tts: any = null;
  private connected: boolean = false;
  
  /**
   * AIVOICEエディタに接続する
   */
  async connect(): Promise<boolean> {
    if (this.connected) {
      return true;
    }
    
    try {
      // winaxを初期化
      await initWinax();
      
      // A.I.VOICE EditorのCOMオブジェクトを生成
      this.tts = new winax.Object('AI.Talk.Editor.Api.TtsControl');
      
      // 利用可能なホスト名の取得
      const hosts = this.tts.GetAvailableHostNames();
      if (!hosts || hosts.length === 0) {
        console.error('利用可能なホストが見つかりません。A.I.VOICE Editorが起動しているか確認してください。');
        return false;
      }
      
      // APIの初期化
      this.tts.Initialize(hosts[0]);
      
      // ホストへの接続
      this.tts.Connect();
      this.connected = true;
      console.log('A.I.VOICE Editorに接続しました。');
      return true;
      
    } catch (error) {
      console.error('接続中にエラーが発生しました:', error);
      this.tts = null;
      return false;
    }
  }
  
  /**
   * AIVOICEエディタから切断する
   */
  disconnect(): void {
    if (!this.connected || !this.tts) {
      return;
    }
    
    try {
      this.tts.Disconnect();
      this.connected = false;
      console.log('A.I.VOICE Editorから切断しました。');
    } catch (error) {
      console.error('切断中にエラーが発生しました:', error);
    }
  }
  
  /**
   * 利用可能な話者（キャラクター）のリストを取得する
   */
  async getAvailableVoices(): Promise<{ standard: string[], presets: string[] } | null> {
    if (!await this.connect()) {
      return null;
    }
    
    const voices = {
      standard: [] as string[],
      presets: [] as string[],
    };
    
    try {
      // 標準キャラクター名の取得
      try {
        voices.standard = Array.from(this.tts.VoiceNames);
      } catch (error) {
        console.error('標準キャラクター名の取得に失敗しました:', error);
      }
      
      // ボイスプリセット名の取得
      try {
        voices.presets = Array.from(this.tts.VoicePresetNames);
      } catch (error) {
        console.error('ボイスプリセット名の取得に失敗しました:', error);
      }
      
      return voices;
      
    } catch (error) {
      console.error('話者リストの取得中にエラーが発生しました:', error);
      return null;
    }
  }
  
  /**
   * 現在設定されている話者（キャラクター）名を取得する
   */
  async getCurrentVoice(): Promise<string | null> {
    if (!await this.connect()) {
      return null;
    }
    
    try {
      return this.tts.CurrentVoicePresetName;
    } catch (error) {
      console.error('現在の話者名の取得中にエラーが発生しました:', error);
      return null;
    }
  }
  
  /**
   * 話者（キャラクター）を設定する
   */
  async setVoice(voiceName: string): Promise<boolean> {
    if (!await this.connect()) {
      return false;
    }
    
    try {
      // 利用可能なボイスプリセット名の取得
      const voicePresetNames = Array.from(this.tts.VoicePresetNames);
      
      // 指定された話者が利用可能かチェック
      if (voicePresetNames.includes(voiceName)) {
        this.tts.CurrentVoicePresetName = voiceName;
        console.log(`話者を '${voiceName}' に設定しました。`);
        return true;
      } else {
        console.error(`指定された話者 '${voiceName}' は利用できません。`);
        return false;
      }
      
    } catch (error) {
      console.error('話者の設定中にエラーが発生しました:', error);
      return false;
    }
  }
  
  /**
   * テキストを音声に変換し、ファイルに保存する
   */
  async synthesize(text: string, outputPath?: string, voiceName?: string): Promise<string | null> {
    if (!text || text.trim() === '') {
      console.error('テキストが空です。');
      return null;
    }
    
    if (!await this.connect()) {
      return null;
    }
    
    // 出力パスが指定されていない場合は一時ファイルを作成
    if (!outputPath) {
      const tmpDir = path.join(process.cwd(), 'tmp');
      
      // tmp ディレクトリが存在しない場合は作成
      try {
        await fs.mkdir(tmpDir, { recursive: true });
      } catch (error) {
        console.error('一時ディレクトリの作成に失敗しました:', error);
        return null;
      }
      
      // ランダムなファイル名を生成
      outputPath = path.join(tmpDir, `${randomUUID()}.wav`);
    } else {
      // 出力ディレクトリが存在しない場合は作成
      const outputDir = path.dirname(outputPath);
      try {
        await fs.mkdir(outputDir, { recursive: true });
      } catch (error) {
        console.error('出力ディレクトリの作成に失敗しました:', error);
        return null;
      }
    }
    
    try {
      // 話者の設定（指定されている場合）
      if (voiceName) {
        if (!await this.setVoice(voiceName)) {
          console.log('デフォルトの話者を使用します。');
        }
      }
      
      // 現在の話者を表示
      try {
        const currentVoice = this.tts.CurrentVoicePresetName;
        console.log(`使用する話者: ${currentVoice}`);
      } catch (error) {
        // 無視
      }
      
      // テキストの設定
      console.log(`テキストを設定しています: ${text.length > 50 ? `${text.substring(0, 50)}...` : text}`);
      this.tts.Text = text;
      
      // 音声ファイルの保存
      console.log(`音声を生成して ${outputPath} に保存しています...`);
      this.tts.SaveAudioToFile(outputPath);
      console.log(`音声ファイルが正常に保存されました: ${outputPath}`);
      
      return outputPath;
      
    } catch (error) {
      console.error('音声合成処理中にエラーが発生しました:', error);
      return null;
    }
  }
  
  /**
   * テキストを読み上げる（音声ファイルは保存せず）
   * 注意: サーバーサイドでこの関数を呼び出す場合、音声を再生できる環境が必要です
   */
  async play(text: string, voiceName?: string): Promise<boolean> {
    if (!text || text.trim() === '') {
      console.error('テキストが空です。');
      return false;
    }
    
    if (!await this.connect()) {
      return false;
    }
    
    try {
      // 話者の設定（指定されている場合）
      if (voiceName) {
        if (!await this.setVoice(voiceName)) {
          console.log('デフォルトの話者を使用します。');
        }
      }
      
      // テキストの設定
      this.tts.Text = text;
      
      // 読み上げの開始
      console.log('音声を再生しています...');
      this.tts.Play();
      
      // 再生が終了するまで待機
      await new Promise<void>((resolve) => {
        const checkIsPlaying = () => {
          if (this.tts.IsPlaying) {
            setTimeout(checkIsPlaying, 100);
          } else {
            resolve();
          }
        };
        checkIsPlaying();
      });
      
      console.log('再生が終了しました。');
      return true;
      
    } catch (error) {
      console.error('音声再生中にエラーが発生しました:', error);
      return false;
    }
  }
}

/**
 * シングルトンインスタンスの取得
 */
let instance: AIVoiceTTS | null = null;

export function getAIVoiceTTS(): AIVoiceTTS {
  if (!instance) {
    instance = new AIVoiceTTS();
  }
  return instance;
}

/**
 * サーバーアプリケーション終了時に接続を切断するためのクリーンアップ関数
 */
export function cleanup(): void {
  if (instance) {
    instance.disconnect();
    instance = null;
  }
}
