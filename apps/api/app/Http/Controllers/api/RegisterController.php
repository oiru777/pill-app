<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class RegisterController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // 自動ログイン
        Auth::login($user);

        // メール認証通知を送る
        event(new Registered($user));


        if (! $user->hasVerifiedEmail()) {
            return response()->json([
                'message' => '確認メールを送信しました。メールを確認してください。'
            ], 202); // ← ステータス202：処理完了だが認証未完了
        }

        // 認証済みならログイン継続
        return response()->json($user);
    }
}
