<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Drop the existing foreign key constraint on supplier_id
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->dropForeign(['supplier_id']);
        });

        // 2. Add the correct foreign key constraint to suppliers table
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->foreign('supplier_id')
                ->references('id')
                ->on('suppliers')
                ->onDelete('restrict')
                ->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 1. Drop the foreign key constraint
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->dropForeign(['supplier_id']);
        });

        // 2. Add back the original foreign key to users table
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->foreign('supplier_id')
                ->references('id')
                ->on('users')
                ->onDelete('restrict');
        });
    }
};
