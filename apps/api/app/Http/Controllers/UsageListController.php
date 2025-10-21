<?php

namespace App\Http\Controllers;

use App\Models\UsageList;
use App\Models\UsageItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UsageListController extends Controller
{
    /**
     * 一覧取得（関連アイテムと薬情報付き）
     */
    // App\Http\Controllers\Api\UsageListController.php

    // 全ユーザーの記録（管理・共有用）
    public function index()
    {
        $usages = UsageList::with(['items.pill', 'user','comments.user'])
            ->orderBy('timestamp', 'desc')
            ->get();

        return response()->json($usages);
    }

    // 👤 自分の記録のみ
    public function myLists(Request $request)
    {
        $user = $request->user();

        $usages = UsageList::with(['items.pill', 'user'])
            ->where('user_id', $user->id)
            ->orderBy('timestamp', 'desc')
            ->get();

        return response()->json($usages);
    }
    // 折れ線グラフ用
    public function graphData()
    {
        $lists = UsageList::with(['items.pill', 'user'])
            ->where('user_id', 3)
            ->orderBy('timestamp', 'desc')
            ->get();

        $result = [];

        foreach ($lists as $list) {
            foreach ($list->items as $item) {
                $result[] = [
                    'timestamp' => $list->timestamp,
                    'pill_name' => $item->pill->name,
                    'quantity' => $item->quantity,
                ];
            }
        }

        return response()->json($result);
    }
    /**
     * 新規登録
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'nullable|integer|exists:users,id',
            'content' => 'nullable|string',
            'timestamp' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.pill_id' => 'required|integer|exists:pills,id',
            'items.*.quantity' => 'required|numeric|min:1',
        ]);

        // ログイン中ユーザーを取得
        $user = $request->user();

        // usage_lists に登録（created_at, updated_at は自動で記録）
        $usageList = UsageList::create([
            'user_id' => Auth::id(),
            'content' => $validated['content'] ?? null,
            'timestamp' => $validated['timestamp'],
        ]);

        // usage_items に関連データを登録
        foreach ($validated['items'] as $item) {
            UsageItem::create([
                'usage_id' => $usageList->id,
                'pill_id' => $item['pill_id'],
                'quantity' => $item['quantity'],
                'timestamp' => $validated['timestamp'],
            ]);
        }

        return response()->json(
            $usageList->load('items.pill'),
            201
        );
    }

    /**
     * 詳細取得
     */
    public function show($id)
    {
        $usageList = UsageList::with('items.pill','user','comments.user','comments.user')->findOrFail($id);
        return response()->json($usageList);
    }

    /**
     * 更新（contentやtimestampの変更）
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'content' => 'nullable|string',
            'timestamp' => 'nullable|date',
        ]);

        $usageList = UsageList::findOrFail($id);
        $usageList->update($validated);

        // updated_at は自動で更新される
        return response()->json($usageList->fresh('items.pill'));
    }

    /**
     * 削除
     */
    public function destroy($id)
    {
        $usageList = UsageList::findOrFail($id);
        $usageList->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }
}
