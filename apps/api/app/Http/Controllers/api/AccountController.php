<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;

class AccountController extends ApiBaseController
{
    public function test(Request $request){
        // dd( env('SESSION_SECURE_COOKIE'));
        // dd( env('SESSION_SECURE_COOKIE'));
        // dd( config('sanctum.stateful'));
        // dd($request);
        // dd('ok');
        return $this->createResultResponse('ok');
    }
}
