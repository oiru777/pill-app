<?php

use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\LoginController;
use App\Http\Controllers\Api\RegisterController;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Str;
use App\Http\Controllers\PillController;
use App\Http\Controllers\UsageListController;
use App\Http\Controllers\UsageItemController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\UserController;

Route::middleware(['web'])->prefix('/v1.0')->group(function () {

    // 認証系（ログイン、ログアウト、登録）
    Route::post('/login', [LoginController::class, 'login']);
    Route::post('/logout', [LoginController::class, 'logout']);
    Route::post('/register', [RegisterController::class, 'register']);
    

    // 🔹 薬関連
    Route::get('/pills', [PillController::class, 'index']);      // 薬一覧
    Route::get('/pills/{id}', [PillController::class, 'show']);  // 特定の薬を取得

    // 🔹 使用履歴（UsageList）
    Route::get('/usage-lists', [UsageListController::class, 'index']); // 全部
    Route::get('/usage-lists/my', [UsageListController::class, 'myLists']); // 自分の分
    Route::get('/usage-lists/{id}', [UsageListController::class, 'show']); // 詳細
    Route::get('/usage-lists/user/{userId}', [UsageListController::class, 'userLists']);
    Route::delete('/usage-lists/{id}', [UsageListController::class, 'destroy']);
    Route::put('/usage-lists/{id}', [UsageListController::class, 'update']);

    Route::post('/usage-lists', [UsageListController::class, 'store']); // 登録
    Route::post('/usage-lists/{usageList}/comments', [CommentController::class, 'store']);
    Route::get('/usage-lists/{usageList}/comments', [CommentController::class, 'index']);

    Route::get('/my-stop-pill-day', [UsageListController::class, 'myStopPillDay']); // 詳細

    Route::get('/usage-graph', [UsageListController::class, 'graphData']);

    // 🔹 使用アイテム（UsageItem）
    Route::get('/usage-items', [UsageItemController::class, 'index']); // 一覧（usage_idで絞り込み可）
    Route::get('/usage-items/{id}', [UsageItemController::class, 'show']); // 詳細



    // パスワードリセットリンク送信
    Route::post('/forgot-password', function (Request $request) {
        $request->validate(['email' => 'required|email']);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        return $status === Password::RESET_LINK_SENT
            ? response()->json(['message' => 'リセットリンクを送信しました。'])
            : response()->json(['message' => '送信に失敗しました。'], 500);
    });

    Route::post('/reset-password', function (Request $request) {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => bcrypt($password),
                ])->save();
            }
        );

        return $status === Password::PASSWORD_RESET
            ? response()->json(['message' => 'パスワードをリセットしました。'])
            : response()->json(['message' => 'リセットに失敗しました。'], 422);
    });



    // 認証後のみアクセス可能
    Route::middleware('auth:sanctum')->group(function () {

        // メール認証ステータス確認
        Route::get('/email/verify', function (Request $request) {
            return $request->user()->hasVerifiedEmail()
                ? response()->json(['verified' => true])
                : response()->json(['verified' => false]);
        });

        // メール認証リンクの再送
        Route::post('/email/verification-notification', function (Request $request) {
            if ($request->user()->hasVerifiedEmail()) {
                return response()->json(['message' => 'Already verified']);
            }

            $request->user()->sendEmailVerificationNotification();

            return response()->json(['message' => 'Verification link sent']);
        });


        // 認証後の簡単なテストエンドポイント
        Route::get('/test', [AccountController::class, 'test']);

        // 現在のユーザー情報取得
        Route::get('/user', function (Request $request) {
            return response()->json($request->user());
        });

        
    });
});


