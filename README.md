# Test MCP Server

A simple test server for the Model Context Protocol (MCP) to verify MCP functionality.

## 機能

このテストサーバーは以下の機能を提供します：

### Tools（ツール）
- **add**: 2つの数値を加算
- **subtract**: 2つの数値を減算
- **multiply**: 2つの数値を乗算
- **divide**: 2つの数値を除算（ゼロ除算チェック付き）

### Resources（リソース）
- **test://server-info**: サーバーの基本情報
- **test://capabilities**: サーバーの機能一覧
- **test://sample-data**: サンプルデータ

### Prompts（プロンプト）
- **calculate**: 計算の実行と説明
- **explain-math**: 数学概念の説明
- **help**: ヘルプ情報の表示

## セットアップ

```bash
# 依存関係のインストール
npm install

# TypeScriptのコンパイル
npm run build

# サーバーの起動
npm start

# 開発モード（コンパイル + 起動）
npm run dev
```

## 使用方法

このサーバーはMCPクライアント（Claude Code等）から以下のように使用できます：

### ツールの使用例
```typescript
// 加算
{ "name": "add", "arguments": { "a": 5, "b": 3 } }

// 除算（エラーハンドリング付き）
{ "name": "divide", "arguments": { "a": 10, "b": 2 } }
```

### リソースの取得例
```typescript
// サーバー情報の取得
{ "uri": "test://server-info" }

// 機能一覧の取得
{ "uri": "test://capabilities" }
```

### プロンプトの使用例
```typescript
// 計算の実行
{ "name": "calculate", "arguments": { "operation": "addition", "numbers": "5, 3, 2" } }

// 数学概念の説明
{ "name": "explain-math", "arguments": { "concept": "multiplication", "level": "beginner" } }
```

## ファイル構造

```
src/
├── server.ts              # メインサーバーファイル
├── tools/
│   └── calculator.ts      # 計算ツールの実装
├── resources/
│   └── static.ts         # 静的リソースの実装
└── prompts/
    └── templates.ts      # プロンプトテンプレートの実装
```

## MCP仕様への準拠

このサーバーは以下のMCP仕様に準拠しています：

- JSON-RPC 2.0ベースの通信
- 標準的なツール、リソース、プロンプトのインターフェース
- 適切なエラーハンドリング
- セキュリティベストプラクティス

## テスト

サーバーが正常に動作することを確認するには：

1. サーバーをビルド・起動
2. MCPクライアントから接続
3. 各機能（ツール、リソース、プロンプト）をテスト

## Claude Desktopでの使用方法

### 設定手順

1. **Claude Desktopの設定を確認**
   ```bash
   # Claude Desktop設定ファイルの場所
   ~/Library/Application Support/Claude/config.json
   ```

2. **MCP設定の追加**
   
   設定ファイルは既に更新済みです。以下の設定が追加されています：
   ```json
   {
     "mcpServers": {
       "test-mcp-server": {
         "command": "node",
         "args": ["/Users/yama/Documents/src/testmcp/dist/server.js"],
         "disabled": false
       }
     }
   }
   ```

3. **サーバーの準備**
   ```bash
   # プロジェクトディレクトリに移動
   cd /Users/yama/Documents/src/testmcp
   
   # 依存関係のインストール（初回のみ）
   npm install
   
   # ビルド
   npm run build
   ```

4. **Claude Desktopを再起動**
   
   設定を有効にするためにClaude Desktopを完全に終了し、再起動してください。

### 動作確認

Claude Desktop再起動後、以下の機能が利用可能になります：

#### プロンプト前処理機能（NEW!）
すべてのClaude Desktopへの質問に対して、自動的に以下の指示が追加されます：
- 計算が必要な場合は必ずcalculatorツールを使用
- 情報が必要な場合はリソースを参照
- 正確性を保つためツールの結果を使用

#### ツールの使用
- **計算の実行**: 「5と3を足して」「10を2で割って」
- **エラーハンドリング**: 「10を0で割って」（ゼロ除算エラーを確認）

#### リソースの確認
- **サーバー情報**: 「test://server-infoの内容を教えて」
- **機能一覧**: 「test://capabilitiesのデータを表示して」

#### プロンプトの使用
- **計算説明**: 「calculateプロンプトを使って加算の説明をして」
- **ヘルプ**: 「helpプロンプトでサーバーの使い方を教えて」

#### 前処理機能のテスト
単純に「2 + 3は何ですか？」と質問するだけで、自動的にaddツールが使用されるようになります。

### ログの確認方法

#### 📋 ログファイルでの確認
```bash
# 最新のログを表示
node view-logs.js

# リアルタイムでログを監視
node view-logs.js --watch
```

#### 📍 ログファイルの場所
```
/Users/yama/.mcp-logs/mcp-server.log
```
**注意**: Claude Desktop実行時は、ホームディレクトリの`.mcp-logs`フォルダにログが保存されます。

#### 🔍 Claude Desktopでの確認
Claude Desktopは**Developer Tools**でMCPサーバーのconsole.error出力を確認できます：

1. **macOS**: `Cmd + Option + I` または `View > Developer > Developer Tools`
2. **Console**タブを選択
3. サーバーからの`[MCP-LOG]`メッセージを確認

### トラブルシューティング

1. **サーバーが認識されない場合**
   ```bash
   # ビルドの確認
   npm run build
   
   # 手動でサーバーテスト
   node dist/server.js
   
   # ログを確認
   node view-logs.js
   ```

2. **パスの問題**
   - config.jsonのパスが正しいか確認
   - dist/server.jsが存在するか確認

3. **権限の問題**
   ```bash
   # 実行権限の確認
   chmod +x start-server.sh
   ```

4. **ログが表示されない場合**
   ```bash
   # ログディレクトリとファイルを確認
   ls -la logs/
   
   # サーバーを再起動してログ出力をテスト
   npm run dev
   ```

## 技術仕様

- Node.js 18.0.0以上
- TypeScript 5.0.0以上
- @modelcontextprotocol/sdk ^1.0.0