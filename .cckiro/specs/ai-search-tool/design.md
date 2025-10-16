# 生成AI検索ツール - 設計書

## 1. アーキテクチャ概要

### 1.1 全体構成
```
app/
├── ai-search/
│   ├── page.tsx           # 検索ページ（クライアントコンポーネント）
│   └── layout.tsx         # レイアウト（オプション）
├── api/
│   └── ai-search/
│       └── route.ts       # AI検索API（ストリーミング対応）
└── components/
    └── ai-search/
        ├── SearchInput.tsx      # 検索入力コンポーネント
        ├── SearchResults.tsx    # 検索結果表示コンポーネント
        └── SearchHistory.tsx    # 検索履歴コンポーネント
```

### 1.2 データフロー
1. ユーザーが`SearchInput`にクエリを入力
2. フォーム送信で`/api/ai-search`にPOSTリクエスト
3. APIルートがOpenRouter経由でAIモデルを呼び出し
4. ストリーミングレスポンスを返却
5. `SearchResults`がリアルタイムで結果を表示
6. 検索履歴は状態管理で保持

## 2. コンポーネント設計

### 2.1 SearchInput.tsx
**責務**: 検索クエリの入力と送信

**Props**:
```typescript
interface SearchInputProps {
  onSubmit: (query: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}
```

**主な機能**:
- テキストエリアでクエリ入力
- Enterキー（Shift+Enterで改行）で送信
- 送信中はボタン無効化
- 送信後に入力フィールドをクリア

### 2.2 SearchResults.tsx
**責務**: AI生成結果のリアルタイム表示

**Props**:
```typescript
interface SearchResultsProps {
  content: string;
  isStreaming: boolean;
}
```

**主な機能**:
- ストリーミング中の文章を段階的に表示
- ローディングインジケーター表示
- マークダウン対応（オプション）

### 2.3 SearchHistory.tsx
**責務**: 過去の検索履歴表示

**Props**:
```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface SearchHistoryProps {
  messages: Message[];
}
```

**主な機能**:
- ユーザーの質問とAIの回答をペアで表示
- タイムスタンプ表示
- スクロール可能なリスト

### 2.4 page.tsx (メインページ)
**責務**: 全体の状態管理とコンポーネント統合

**状態管理**:
```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const [messages, setMessages] = useState<ChatMessage[]>([]);
const [currentResponse, setCurrentResponse] = useState('');
const [isLoading, setIsLoading] = useState(false);
```

**主な機能**:
- use-chat-submitまたはfetchでAPI呼び出し
- ストリーミングレスポンスの処理
- メッセージ履歴の管理
- エラーハンドリング

## 3. API設計

### 3.1 POST /api/ai-search/route.ts
**リクエスト**:
```typescript
{
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}
```

**レスポンス**:
- ストリーミングレスポンス（Server-Sent Events形式）
- Vercel AI SDKの`StreamingTextResponse`を使用

**実装**:
```typescript
import { openrouter } from '@openrouter/ai-sdk-provider';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openrouter('meta-llama/llama-3.3-70b-instruct'),
    messages,
  });

  return result.toDataStreamResponse();
}
```

## 4. 状態管理

### 4.1 クライアント側状態
- **messages**: 全検索履歴（ローカル状態）
- **currentResponse**: 現在ストリーミング中の回答
- **isLoading**: ローディング状態

### 4.2 状態更新フロー
1. ユーザー入力 → messagesに追加（role: 'user'）
2. API呼び出し開始 → isLoading = true
3. ストリーミング受信 → currentResponseを逐次更新
4. ストリーミング完了 → messagesに追加（role: 'assistant'）、currentResponseクリア
5. isLoading = false

## 5. スタイリング

### 5.1 レイアウト
- フレックスボックスで縦方向レイアウト
- 検索履歴: スクロール可能な領域（flex-grow）
- 検索入力: 固定下部

### 5.2 デザイン方針
- シンプルなチャットUI風デザイン
- ユーザーメッセージ: 右寄せ、背景色あり
- AIメッセージ: 左寄せ、異なる背景色
- Tailwind CSSのユーティリティクラスを使用

## 6. エラーハンドリング

### 6.1 クライアント側
- API呼び出し失敗時: エラーメッセージ表示
- ネットワークエラー: リトライ可能な旨を通知
- try-catchでエラーをキャッチ

### 6.2 サーバー側
- OpenRouter API エラー: 適切なHTTPステータスコードを返却
- バリデーションエラー: 400 Bad Request
- サーバーエラー: 500 Internal Server Error

## 7. テスト戦略

### 7.1 単体テスト（Vitest）
- 各コンポーネントの描画テスト
- フォーム送信処理のテスト
- API ルートのモックテスト

### 7.2 統合テスト
- ユーザー入力から結果表示までのフロー
- エラーハンドリングの動作確認

## 8. 技術的考慮事項

### 8.1 パフォーマンス
- ストリーミングで初回応答時間を短縮
- 不要な再レンダリングを防ぐ（React.memo、useCallback）

### 8.2 アクセシビリティ
- フォーム要素に適切なラベル
- キーボード操作対応
- ARIA属性の適切な使用

### 8.3 セキュリティ
- API Keyは環境変数で管理（既存設定を利用）
- XSS対策（Reactのデフォルト挙動で対応）
- CSRF対策（Next.jsのデフォルト設定）

## 9. 実装の優先順位

1. **フェーズ1**: 基本機能
   - API ルート実装
   - シンプルな検索ページ（1ファイルで完結）

2. **フェーズ2**: コンポーネント分割
   - SearchInput、SearchResults、SearchHistoryに分割
   - スタイリング改善

3. **フェーズ3**: 拡張機能
   - テスト追加
   - エラーハンドリング強化
   - UI/UX改善
