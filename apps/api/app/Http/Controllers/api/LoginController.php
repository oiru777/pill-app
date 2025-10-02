<?php

namespace App\Http\Controllers\Api;

use App\Consts\AppConst;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class LoginController extends ApiBaseController
{
    /**
     * Login
     *
     * @param Request $request
     * @return array
     */
    public function login(Request $request){
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);
        
        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();
            $response  = Auth::user(); // 現在認証しているユーザーを取得
            // $id = Auth::id(); // 現在認証しているユーザーのIDを取得
            return response()->json($response);
        }
        return response()->json([], 401);
    }

    /**
     * Logout
     *
     * @param Request $request
     * @return array
     */
    public function logout(Request $request){
        Auth::logout();
         // セッションをクリア＆セッションIDを再発行(Illuminate\Session\Store::invalidate)
        $request->session()->invalidate();
         // CSRFトークンを再生成して、二重送信対策
        $request->session()->regenerateToken();
        return response()->json(true);
    }


}
