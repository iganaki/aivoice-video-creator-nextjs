# AIVoice Video Creator (Next.js)

Next.jsを使用したAIVOICEテキスト音声合成と動画作成アプリケーション

## 概要

このプロジェクトは、AIVOICEエディタを利用してテキストを音声に変換し、その音声と画像を組み合わせて動画を作成するWebアプリケーションです。

## 技術スタック

### コア技術
- TypeScript: ^5.0.0
- Node.js: ^20.0.0

### フロントエンド
- Next.js: ^15.1.3
- React: ^19.0.0
- Tailwind CSS: ^3.4.17
- shadcn/ui: ^2.1.8

### バックエンド
- SQLite: ^3.0.0
- Prisma: ^5.0.0

## 機能

- AIVOICEエディタを使ったテキスト音声合成
- 複数の話者（キャラクター）の選択と切り替え
- 画像と音声を組み合わせた動画作成
- プロジェクト管理機能

## 必要条件

- Windows環境（AIVOICEがWindows専用のため）
- Node.js v20.0.0以上
- A.I.VOICE Editor（インストール済みであること）
- FFmpeg（動画作成機能を使用する場合）

## インストール方法

```bash
# リポジトリをクローン
git clone https://github.com/iganaki/aivoice-video-creator-nextjs.git
cd aivoice-video-creator-nextjs

# 依存パッケージをインストール
npm install

# 開発サーバーを起動
npm run dev
```

## 使用方法

1. ブラウザで `http://localhost:3000` にアクセス
2. AIVOICEの話者を選択
3. テキストを入力または読み込み
4. 音声を生成
5. 必要に応じて画像を選択して動画を作成

## 開発ステータス

現在、以下の機能を段階的に実装中です：

- [ ] Next.jsプロジェクトの初期設定
- [ ] AIVOICEエディタとの連携機能
- [ ] テキスト音声合成のUI実装
- [ ] 動画作成機能
- [ ] プロジェクト管理機能

## ライセンス

MITライセンス
