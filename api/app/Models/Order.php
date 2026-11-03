<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
  protected $fillable = [
    'name', 'phone', 'district', 'address', 'description',
    'preferred_date', 'preferred_time', 'estimated_hours',
    'consent', 'services', 'photos',
  ];

  protected $casts = [
    'services' => 'array',
    'photos' => 'array',
    'consent' => 'boolean',
  ];
}
