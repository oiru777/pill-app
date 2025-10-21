<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UsageList;
use App\Models\Comment;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    // コメント一覧取得
    public function index(UsageList $usageList)
    {
        $comments = $usageList->comments()
            ->with('user:id,name')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($comments);
    }

    // コメント追加
    public function store(Request $request, UsageList $usageList)
    {
        $request->validate([
            'content' => 'required|string|max:500',
        ]);

        $comment = Comment::create([
            'usage_list_id' => $usageList->id,
            'user_id' => Auth::id(),
            'content' => $request->content,
        ]);

        return response()->json([
            'message' => 'コメントを追加しました',
            'comment' => $comment->load('user:id,name'),
        ], 201);
    }
}
