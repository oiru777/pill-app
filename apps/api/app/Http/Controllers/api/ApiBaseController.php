<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;

class ApiBaseController extends Controller
{
    public static $ERROR_CODE = [
        'UNKNOWN_ERROR' =>[
            "status_code" => 500,
            "message"=>"不明なエラーが発生しました。",
        ],
        'HEADER_APPID_ERROR' => [
            "status_code" => 401,
            "message"=>"ヘッダにアプリケーションキーがありません。",
        ],
    ];

    /**
     * 正常レスポンス
     *
     * @param [type] $response_data
     * @param [type] $pagination_data
     * @return \Illuminate\Http\Response|\Illuminate\Contracts\Routing\ResponseFactory
     */
    public static function createResultResponse($response_data=null, $pagination_data=null){
        $response = [
            'status' => true,
            'errors' => [],
            'summary' => '',
            'data' => $response_data,
        ];
        if(isset($pagination_data)){
            $response['pagination'] = $pagination_data;
        }
        return response()->json($response, 200);
    }

    /**
     * ページネーションの場合の正常レスポンス
     *
     * @param [type] $pagination_collection
     * @return \Illuminate\Http\Response|\Illuminate\Contracts\Routing\ResponseFactory
     */
    public static function createResultResponseByPagination($pagination_collection){
        $paginate = self::getPaginateData($pagination_collection);
        $response = $pagination_collection->items();
        return self::createResultResponse($response, $paginate);
    }

    /**
     * エラーのレスポンス
     *
     * @param array $error_code
     * @return \Illuminate\Http\Response|\Illuminate\Contracts\Routing\ResponseFactory
     */
    public static function createErrorResponse(array $error_code){
        $errors = [];
        $status_code = 400;
        foreach($error_code as $code){
            $status_code = ApiBaseController::$ERROR_CODE[$code['ID']]['status_code'];
            $errors = [];
            $error['column'] = $code['COLUMN'];
            $error['message'] = ApiBaseController::$ERROR_CODE[$code['ID']]['message'];
            $errors[] = $error;
        }
        return response()->json([
            'status' => false,
            'errors' => $errors,
            'data' => null,
        ], $status_code);
    }

    /**
     * ページネーション部分取得
     *
     * @param [type] $pagination_collection
     * @return array
     */
	public static function getPaginateData($pagination_collection) {
        return [
            'current_page' => $pagination_collection->currentPage(),
            'last_page' => $pagination_collection->lastPage(),
            'total' => $pagination_collection->total(),
        ];
    }
}
