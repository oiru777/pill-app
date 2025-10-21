<?php

// app/Models/Comment.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    use HasFactory;

    protected $fillable = ['usage_list_id', 'user_id', 'content'];

    public function usageList()
    {
        return $this->belongsTo(UsageList::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
