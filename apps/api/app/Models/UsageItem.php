<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UsageItem extends Model
{
    use HasFactory;
    protected $fillable = ['usage_id', 'pill_id', 'quantity','timestamp'];

    public function usageList()
    {
        return $this->belongsTo(UsageList::class, 'usage_id');
    }

    public function pill()
    {
        return $this->belongsTo(Pill::class, 'pill_id');
    }
}
