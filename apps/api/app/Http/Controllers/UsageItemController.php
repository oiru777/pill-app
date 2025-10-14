<?php

namespace App\Http\Controllers;

use App\Models\UsageItem;
use Illuminate\Http\Request;


class UsageItemController extends Controller
{
    /**
     * 使用アイテム一覧を取得
     * usage_id で絞り込みも可能
     */
    public function index(Request $request)
    {
        $query = UsageItem::with(['pill', 'usage']);

        // usage_id で絞り込み
        if ($request->has('usage_id')) {
            $query->where('usage_id', $request->input('usage_id'));
        }

        return response()->json($query->get());
    }

    /**
     * 特定の使用アイテムを取得
     */
    public function show($id)
    {
        $item = UsageItem::with(['pill', 'usage'])->findOrFail($id);
        return response()->json($item);
    }

    /**
     * （オプション）個別登録 — 通常は UsageListController 経由で登録
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'usage_id' => 'required|exists:usage_lists,id',
            'pill_id' => 'required|exists:pills,id',
            'quantity' => 'required|integer|min:1',
            'timestamp' => 'required|date',
        ]);

        $item = UsageItem::create($validated);
        return response()->json($item, 201);
    }

    /**
     * 更新（必要なら）
     */
    public function update(Request $request, $id)
    {
        $item = UsageItem::findOrFail($id);

        $validated = $request->validate([
            'pill_id' => 'nullable|exists:pills,id',
            'quantity' => 'nullable|integer|min:1',
            'timestamp' => 'nullable|date',
        ]);

        $item->update($validated);
        return response()->json($item);
    }

    /**
     * 削除
     */
    public function destroy($id)
    {
        UsageItem::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
