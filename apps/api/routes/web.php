<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\Request;

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

Route::get('/', function () {
    return view('welcome');
});

Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
    $request->fulfill();
    return redirect(env('FRONTEND_URL') . '/verified');
})->middleware(['signed'])->name('verification.verify');

// フロントエンドのすべてのリクエストをキャッチするルート
Route::get('{any}', function () {
    return view('app');
})->where('any','.*');

Route::get('/verified', function () {
    return 'メール認証済みです！';
});
