import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <h1 className="text-xl font-semibold">AIVoice Video Creator</h1>
        </div>
      </header>
      <main className="flex-1">
        <section className="container grid items-center gap-6 py-8 md:py-10">
          <div className="flex flex-col items-start gap-2">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
              テキストから音声、そして動画へ
            </h1>
            <p className="text-lg text-muted-foreground">
              AIVOICEを使ってテキストを音声に変換し、画像と組み合わせて動画を作成するアプリケーション
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/tts"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              音声合成を始める
            </Link>
            <Link
              href="/video"
              className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              動画作成を始める
            </Link>
          </div>
        </section>
        
        <section className="container py-8 md:py-12">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border p-6 shadow-sm">
              <h3 className="text-xl font-semibold">簡単音声合成</h3>
              <p className="mt-2 text-muted-foreground">
                AIVOICEエディタと連携し、様々なキャラクターの声でテキストを音声に変換できます。
              </p>
            </div>
            <div className="rounded-lg border p-6 shadow-sm">
              <h3 className="text-xl font-semibold">画像と音声から動画作成</h3>
              <p className="mt-2 text-muted-foreground">
                生成した音声に画像を組み合わせて、簡単に動画を作成することができます。
              </p>
            </div>
            <div className="rounded-lg border p-6 shadow-sm">
              <h3 className="text-xl font-semibold">プロジェクト管理</h3>
              <p className="mt-2 text-muted-foreground">
                作成した音声や動画をプロジェクトとして保存し、後で編集することができます。
              </p>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground">
            &copy; {new Date().getFullYear()} AIVoice Video Creator. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
