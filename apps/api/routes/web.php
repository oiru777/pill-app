<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\Request;
use App\Http\Controllers\PillController;
use App\Http\Controllers\UsageListController;
use App\Http\Controllers\UsageItemController;
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

// 薬一覧・取得用
Route::apiResource('pills', PillController::class)->only(['index', 'show']);

// 使用リスト（usage_lists）
Route::apiResource('usage-lists', UsageListController::class)->only(['index', 'store', 'show']);

// 使用アイテム（usage_items）
Route::apiResource('usage-items', UsageItemController::class)->only(['index']);

Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
    $request->fulfill();
    return redirect(env('FRONTEND_URL') . '/verified');
})->middleware(['signed'])->name('verification.verify');


Route::get('/verified', function () {
    return 'メール認証済みです！';
});

Route::get('/reset-password/{token}', function ($token, Request $request) {
    $query = http_build_query($request->query());
    $url = env('FRONTEND_URL') . "/reset-password/{$token}" . ($query ? "?{$query}" : "");
    return redirect($url);
});