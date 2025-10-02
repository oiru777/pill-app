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


Route::middleware(['web'])->prefix('/v1.0')->group(function () {

    // 認証系（ログイン、ログアウト、登録）
    Route::post('/login', [LoginController::class, 'login']);
    Route::post('/logout', [LoginController::class, 'logout']);
    Route::post('/register', [RegisterController::class, 'register']);

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


