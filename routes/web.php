<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia; // We are going to use this class to render React components

Route::prefix("/")->controller(App\Http\Controllers\BookController::class)->name("books.")->group(function () {
    Route::get("/", "index");
    Route::get("/fetch-data", "fetch_data")->name('fetch-data');
    Route::post("/", "create")->name('create');
    Route::put("/{book}", "update")->name('update');
    Route::delete("/{book}", "delete")->name('delete');
});
