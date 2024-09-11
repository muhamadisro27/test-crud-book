<?php

namespace App\Http\Controllers;

use App\Models\Book;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class BookController extends Controller
{
    //
    public function index()
    {
        return Inertia::render('Homepage');
    }

    public function fetch_data()
    {
        try {
            $result = Book::filter();

            return response()->json($result, Response::HTTP_OK);
        } catch (\Throwable $th) {
            Log::error($th);
            return response()->json([
                'errors' => $th->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function create(Request $request)
    {
        try {
            DB::beginTransaction();

            $data = [
                'name' => $request['name'],
                'author' => $request['author'],
                'years' => $request['years'],
                'slug' =>  str($request['name'])->slug('-')
            ];

            Book::create($data);

            DB::commit();

            $response = [
                'statusCode' => Response::HTTP_CREATED,
                'message' => 'Successfully create new book !'
            ];
        } catch (\Throwable $th) {
            $response = [
                'statusCode' => Response::HTTP_INTERNAL_SERVER_ERROR,
                'message' => $th->getMessage(),
            ];
        }

        return response()->json($response, $response['statusCode']);
    }

    public function update(Request $request, Book $book)
    {
        try {
            DB::beginTransaction();

            $book->name = $request['name'];
            $book->author = $request['author'];
            $book->years = $request['years'];
            $book->slug = str($request['name'])->slug('-');
            $book->save();

            DB::commit();

            $response = [
                'statusCode' => Response::HTTP_OK,
                'message' => 'Successfully update the book !'
            ];
        } catch (\Throwable $th) {
            $response = [
                'statusCode' => Response::HTTP_INTERNAL_SERVER_ERROR,
                'message' => $th->getMessage(),
            ];
        }

        return response()->json($response, $response['statusCode']);
    }

    public function delete(Book $book)
    {
        try {
            DB::beginTransaction();

            $book->delete();

            DB::commit();

            $response = [
                'statusCode' => Response::HTTP_OK,
                'message' => 'Successfully delete book !'
            ];
        } catch (\Throwable $th) {
            //throw $th;

            DB::rollBack();

            $response = [
                'statusCode' => Response::HTTP_INTERNAL_SERVER_ERROR,
                'message' => $th->getMessage(),
            ];
        }

        return response()->json($response, $response['statusCode']);
    }
}
