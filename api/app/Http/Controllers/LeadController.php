<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class LeadController extends Controller
{
  public function store()
  {
    dd(request()->all());
  }

  public function store2(Request $r)
  {
    $data = $r->validate([
      'name' => 'nullable|string|max:100',
      'phone' => 'required|string|max:30',
      'text' => 'nullable|string|max:1000',
    ]);
    \App\Models\Lead::create($data);
    return response()->json(['ok' => true], 201);
  }
}
