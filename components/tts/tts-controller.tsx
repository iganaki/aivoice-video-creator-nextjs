"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Play, Save, Mic } from "lucide-react";

export type Voice = {
  name: string;
  type: "standard" | "preset";
};

export default function TTSController() {
  const [text, setText] = useState("");
  const [voices, setVoices] = useState<Voice[]>([]);
  const [currentVoice, setCurrentVoice] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const { toast } = useToast();

  // 初期化時に利用可能な話者を取得
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const response = await fetch("/api/tts");
        const data = await response.json();

        if (data.success) {
          const standardVoices = data.voices.standard.map((name: string) => ({
            name,
            type: "standard" as const,
          }));
          
          const presetVoices = data.voices.presets.map((name: string) => ({
            name,
            type: "preset" as const,
          }));
          
          setVoices([...standardVoices, ...presetVoices]);
          
          if (data.currentVoice) {
            setCurrentVoice(data.currentVoice);
          } else if (presetVoices.length > 0) {
            setCurrentVoice(presetVoices[0].name);
          } else if (standardVoices.length > 0) {
            setCurrentVoice(standardVoices[0].name);
          }
        } else {
          toast({
            title: "エラー",
            description: data.error || "話者の取得に失敗しました",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("話者の取得中にエラーが発生しました:", error);
        toast({
          title: "エラー",
          description: "A.I.VOICE Editorに接続できませんでした。起動しているか確認してください。",
          variant: "destructive",
        });
      }
    };

    fetchVoices();
  }, [toast]);

  // 話者を変更
  const handleVoiceChange = async (value: string) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/tts/voice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ voiceName: value }),
      });

      const data = await response.json();

      if (data.success) {
        setCurrentVoice(data.voice);
        toast({
          title: "成功",
          description: `話者を "${data.voice}" に変更しました`,
        });
      } else {
        toast({
          title: "エラー",
          description: data.error || "話者の変更に失敗しました",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("話者の変更中にエラーが発生しました:", error);
      toast({
        title: "エラー",
        description: "話者の変更中にエラーが発生しました",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 音声合成
  const handleSynthesize = async () => {
    if (!text.trim()) {
      toast({
        title: "エラー",
        description: "テキストを入力してください",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          voiceName: currentVoice,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAudioUrl(data.audioUrl);
        toast({
          title: "成功",
          description: "音声の生成が完了しました",
        });
      } else {
        toast({
          title: "エラー",
          description: data.error || "音声合成に失敗しました",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("音声合成中にエラーが発生しました:", error);
      toast({
        title: "エラー",
        description: "音声合成中にエラーが発生しました",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mic className="mr-2 h-5 w-5" />
          テキスト音声合成
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="voice-select">話者</Label>
          <Select
            value={currentVoice}
            onValueChange={handleVoiceChange}
            disabled={isLoading || voices.length === 0}
          >
            <SelectTrigger id="voice-select">
              <SelectValue placeholder="話者を選択" />
            </SelectTrigger>
            <SelectContent>
              {voices.length > 0 ? (
                voices.map((voice) => (
                  <SelectItem key={voice.name} value={voice.name}>
                    {voice.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>
                  利用可能な話者がありません
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="text-input">テキスト</Label>
          <Textarea
            id="text-input"
            placeholder="読み上げるテキストを入力してください..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            className="resize-y"
            disabled={isLoading}
          />
        </div>

        {audioUrl && (
          <div className="space-y-2">
            <Label htmlFor="audio-player">音声プレビュー</Label>
            <audio id="audio-player" controls className="w-full" src={audioUrl}>
              お使いのブラウザはオーディオ要素をサポートしていません。
            </audio>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setText("")}
          disabled={isLoading || !text}
        >
          クリア
        </Button>
        <Button
          variant="default"
          onClick={handleSynthesize}
          disabled={isLoading || !text || !currentVoice}
          className="ml-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              処理中...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              音声合成
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
