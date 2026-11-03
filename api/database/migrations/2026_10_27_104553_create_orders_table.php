<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
      Schema::create('orders', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('phone', 32);
        $table->string('district');
        $table->string('address')->nullable();
        $table->text('description');
        $table->date('preferred_date');
        $table->string('preferred_time', 32);
        $table->decimal('estimated_hours', 4, 1);
        $table->boolean('consent')->default(false);
        $table->jsonb('services');
        $table->jsonb('photos')->nullable();
        $table->timestamps();
      });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
