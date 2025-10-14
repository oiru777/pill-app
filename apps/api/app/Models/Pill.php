<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pill extends Model
{
    use HasFactory;
    protected $fillable = ['user_id', 'name', 'price'];
    public $timestamps = false;

    public function usageItems()
    {
        return $this->hasMany(UsageItem::class, 'pill_id');
    }
}
