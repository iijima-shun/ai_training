# 生成AI検索ツール - 実装計画

## 1. 実装の全体フロー

### フェーズ1: 基本機能実装
1. APIルートの実装
2. シンプルな検索ページの実装
3. 動作確認

### フェーズ2: コンポーネント分割とUI改善
4. コンポーネント分割
5. スタイリング改善
6. エラーハンドリング追加

### フェーズ3: テストと最終調整
7. テストの追加
8. 最終動作確認とリファクタリング

## 2. 詳細実装タスク

### タスク1: APIルート実装
**ファイル**: `app/api/ai-search/route.ts`

**実装内容**:
- POSTエンドポイントの作成
- Vercel AI SDKの`streamText`を使用
- OpenRouterプロバイダーの設定
- エラーハンドリング

**コード概要**:
```typescript
import { openrouter } from '@openrouter/ai-sdk-provider';
import { streamText } from 'ai';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = streamText({
      model: openrouter('meta-llama/llama-3.3-70b-instruct'),
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    return new Response('Internal Server Error', { status: 500 });
  }
}
```

**確認事項**:
- 既存のOpenRouter設定（環境変数）が利用可能か確認
- ストリーミングレスポンスが正常に動作するか

---

### タスク2: シンプルな検索ページ実装
**ファイル**: `app/ai-search/page.tsx`

**実装内容**:
- クライアントコンポーネントとして実装（'use client'）
- 状態管理（messages, input, isLoading）
- フォーム送信処理
- ストリーミングレスポンスの受信と表示
- 基本的なUI（テキストエリア、送信ボタン、結果表示）

**状態管理**:
```typescript
const [messages, setMessages] = useState<Array<{
  role: 'user' | 'assistant';
  content: string;
}>>([]);
const [input, setInput] = useState('');
const [isLoading, setIsLoading] = useState(false);
const [currentResponse, setCurrentResponse] = useState('');
```

**API呼び出し**:
- fetchでPOSTリクエスト
- ReadableStreamでストリーミング処理
- TextDecoderで段階的にレスポンスをデコード

**確認事項**:
- フォーム送信が正常に動作するか
- ストリーミング表示がリアルタイムで更新されるか
- 検索履歴が正しく保持されるか

---

### タスク3: 動作確認
**実施内容**:
- `npm run dev`で開発サーバー起動
- `/ai-search`にアクセス
- 検索クエリを入力して動作確認
- エラーが発生しないか確認

**確認ポイント**:
- [ ] ページが正常に表示される
- [ ] 検索クエリを入力できる
- [ ] 送信ボタンが動作する
- [ ] AIの回答がストリーミングで表示される
- [ ] 検索履歴が表示される
- [ ] エラーが発生しない

---

### タスク4: コンポーネント分割
**実装内容**:
以下のコンポーネントに分割

#### 4-1. SearchInput.tsx
**ファイル**: `app/components/ai-search/SearchInput.tsx`

**実装内容**:
- テキストエリアと送信ボタン
- Enterキー送信（Shift+Enterで改行）
- ローディング中の無効化

**Props**:
```typescript
interface SearchInputProps {
  onSubmit: (query: string) => void;
  isLoading: boolean;
}
```

#### 4-2. SearchResults.tsx
**ファイル**: `app/components/ai-search/SearchResults.tsx`

**実装内容**:
- 現在ストリーミング中の回答表示
- ローディングインジケーター

**Props**:
```typescript
interface SearchResultsProps {
  content: string;
  isStreaming: boolean;
}
```

#### 4-3. SearchHistory.tsx
**ファイル**: `app/components/ai-search/SearchHistory.tsx`

**実装内容**:
- メッセージ履歴の表示
- ユーザーとAIのメッセージを区別

**Props**:
```typescript
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface SearchHistoryProps {
  messages: Message[];
}
```

#### 4-4. page.tsx リファクタリング
- 分割したコンポーネントをインポート
- 状態管理とロジックのみを保持

**確認事項**:
- コンポーネント分割後も正常に動作するか
- 型定義が正しいか

---

### タスク5: スタイリング改善
**実装内容**:
- Tailwind CSSでチャットUI風のデザイン
- レスポンシブ対応
- ユーザーメッセージとAIメッセージの視覚的区別

**スタイリング方針**:
- ユーザーメッセージ: 右寄せ、青系背景
- AIメッセージ: 左寄せ、灰色背景
- 検索履歴: スクロール可能
- 検索入力: 下部固定

**確認事項**:
- デザインが一貫しているか
- モバイルでも見やすいか

---

### タスク6: エラーハンドリング追加
**実装内容**:
- API呼び出しのtry-catch
- エラーメッセージの表示
- ネットワークエラーの処理

**エラー表示**:
```typescript
const [error, setError] = useState<string | null>(null);
```

**確認事項**:
- エラー発生時に適切なメッセージが表示されるか
- エラー後も再度検索できるか

---

### タスク7: テスト追加
**実装内容**:
- 各コンポーネントの単体テスト
- Testing Libraryでレンダリングテスト
- ユーザーインタラクションのテスト

**テストファイル**:
- `app/components/ai-search/SearchInput.test.tsx`
- `app/components/ai-search/SearchResults.test.tsx`
- `app/components/ai-search/SearchHistory.test.tsx`

**テスト項目例**:
```typescript
// SearchInput.test.tsx
describe('SearchInput', () => {
  it('renders input field and submit button', () => {});
  it('calls onSubmit with input value', () => {});
  it('disables button when isLoading is true', () => {});
});
```

**確認事項**:
- `npm run test`でテストが通るか

---

### タスク8: 最終動作確認とリファクタリング
**実施内容**:
- 全機能の総合テスト
- コードレビュー
- 不要なコードの削除
- コメント追加

**確認ポイント**:
- [ ] 全ての要件が満たされているか
- [ ] エッジケースが処理されているか
- [ ] Biomeのlint/formatが通るか
- [ ] TypeScriptの型エラーがないか
- [ ] パフォーマンスに問題がないか

**最終確認コマンド**:
```bash
npm run lint
npm run format
npm run typecheck
npm run test
npm run build
```

## 3. 実装順序の補足

### 推奨実装順序
1. タスク1 → タスク2 → タスク3（基本機能完成、動作確認）
2. タスク4 → タスク5（コンポーネント分割、UI改善）
3. タスク6（エラーハンドリング）
4. タスク7 → タスク8（テスト、最終確認）

### 各タスク完了後の確認
- 各タスク完了時に動作確認を実施
- 問題があれば即座に修正
- 次のタスクに進む前に動作を保証

## 4. 技術的注意事項

### ストリーミング実装の注意点
- Vercel AI SDKの`streamText`は自動的にストリーミングレスポンスを処理
- クライアント側でReadableStreamを処理する必要あり
- TextDecoderでバイナリデータをテキストに変換

### 状態管理の注意点
- ストリーミング中は`currentResponse`を使用
- 完了後に`messages`に追加
- 不要な再レンダリングを避けるため、useCallbackやuseMemoを活用

### 型安全性の確保
- 全てのPropsとStateに型定義
- API レスポンスの型も定義
- TypeScriptの厳格モードを維持

## 5. 完了条件

以下の全ての条件を満たすこと:
- [ ] ユーザーが検索クエリを入力できる
- [ ] AIの回答がストリーミングで表示される
- [ ] 検索履歴が保持・表示される
- [ ] エラーハンドリングが実装されている
- [ ] レスポンシブデザインが実装されている
- [ ] テストが実装され、全て通る
- [ ] Biome lint/formatが通る
- [ ] TypeScriptの型エラーがない
- [ ] ビルドが成功する
