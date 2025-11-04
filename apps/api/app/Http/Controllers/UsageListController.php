<?php

namespace App\Http\Controllers;

use App\Models\UsageList;
use App\Models\UsageItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

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

    public function graphData(Request $request)
{
    $user = $request->user();

    // クエリから "month" を取得（例: ?month=2025-10）、未指定なら null
    $month = $request->query('month');

    // クエリがある場合は月初〜月末で絞り込み、なければ全件取得
    if ($month) {
        $startOfMonth = Carbon::parse($month)->startOfMonth();
        $endOfMonth = Carbon::parse($month)->endOfMonth();

        $lists = UsageList::with(['items.pill', 'user'])
            ->where('user_id', $user->id) 
            ->whereBetween('timestamp', [$startOfMonth, $endOfMonth])
            ->orderBy('timestamp', 'asc')
            ->get();
    } else {
        // month 指定なし → 全件取得
        $lists = UsageList::with(['items.pill', 'user'])
            ->where('user_id', $user->id) 
            ->orderBy('timestamp', 'asc')
            ->get();
    }

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

// 連続服用日数を計算
public function myStopPillDay(Request $request)
{
    $user = $request->user();

    // 全ての服薬記録を取得（日付順）
    $usages = UsageList::where('user_id', $user->id)
        ->orderBy('timestamp', 'desc')
        ->get();

    // 服薬記録がない場合
    if ($usages->isEmpty()) {
        return response()->json([
            'stop_days' => 0,
            'consecutive_usage_days' => 0,
            'last_usage_date' => null,
            'message' => '服薬記録がありません'
        ]);
    }

    $lastUsageDate = Carbon::parse($usages->first()->timestamp);
    $now = Carbon::now();
    $stopDays = $lastUsageDate->diffInDays($now);

    // 断薬中（最終服薬日が今日でない）の場合、連続服用日数は0
    if ($stopDays > 0) {
        return response()->json([
            'stop_days' => $stopDays,
            'consecutive_usage_days' => 0,
            'last_usage_date' => $lastUsageDate->format('Y-m-d H:i:s'),
            'message' => "{$stopDays}日間断薬中です"
        ]);
    }

    // 連続服用日数を計算（今日も服用している場合のみ）
    $consecutiveUsageDays = 1; // 今日の記録は1日目
    $previousDate = $lastUsageDate->copy()->startOfDay();

    for ($i = 1; $i < $usages->count(); $i++) {
        $currentDate = Carbon::parse($usages[$i]->timestamp)->startOfDay();
        $daysDiff = $previousDate->diffInDays($currentDate);

        // 1日違い（連続）なら加算
        if ($daysDiff === 1) {
            $consecutiveUsageDays++;
            $previousDate = $currentDate;
        } 
        // 同じ日（複数回服用）ならカウントしない
        elseif ($daysDiff === 0) {
            $previousDate = $currentDate;
            continue;
        }
        // 2日以上空いたら連続終了
        else {
            break;
        }
    }

    return response()->json([
        'stop_days' => 0,
        'consecutive_usage_days' => $consecutiveUsageDays,
        'last_usage_date' => $lastUsageDate->format('Y-m-d H:i:s'),
        'message' => "{$consecutiveUsageDays}日間連続服用中です"
    ]);
}
}

