<?php

namespace App\Models;

use App\Http\Resources\BookCollection;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    use HasFactory;

    protected $fillable =
    [
        'name',
        'years',
        'slug',
        'author',
    ];

    public function getRouteKeyName()
    {
        return 'slug';
    }

    public function createdAt(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => Carbon::parse($value)->translatedFormat('D, d F Y')
        );
    }

    public static function filter()
    {
        $pagination = request('pagination.pageSize');
        $search = request('search');

        $books = self::when($search, function ($q) use ($search) {
                $q->where('name', 'LIKE',  $search . '%')
                    ->orWhere('author', 'LIKE',  $search . '%');
            })
            ->orderBy('created_at', 'DESC')
            ->paginate($pagination);


        return $books;
    }
}
