<?php

namespace App\Http\Controllers;

use App\Models\Pill;
use Illuminate\Http\Request;

class PillController extends Controller
{
    // 一覧取得（例：ユーザーIDで絞る）
    public function index(Request $request)
    {
        $query = Pill::query();

        // user_id パラメータが指定されていれば絞り込み
        if ($request->has('user_id')) {
            $query->where('user_id', $request->input('user_id'));
        }

        return response()->json($query->orderBy('id')->get());
    }

    // 新規登録
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|string',
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
        ]);

        $pill = Pill::create($validated);
        return response()->json($pill, 201);
    }

    // 詳細取得
    public function show($id)
    {
        return response()->json(Pill::findOrFail($id));
    }

    // 更新
    public function update(Request $request, $id)
    {
        $pill = Pill::findOrFail($id);

        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'price' => 'nullable|numeric|min:0',
        ]);

        $pill->update($validated);
        return response()->json($pill);
    }

    // 削除
    public function destroy($id)
    {
        Pill::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
