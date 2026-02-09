<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SourceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sources = [
            ['name' => 'Website', 'source_code' => 'WEB', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Phone Call', 'source_code' => 'PHONE', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Email', 'source_code' => 'EMAIL', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Referral', 'source_code' => 'REFERRAL', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Social Media', 'source_code' => 'SOCIAL_MEDIA', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Walk-In', 'source_code' => 'WALK_IN', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Other', 'source_code' => null, 'created_at' => now(), 'updated_at' => now()], // Example of nullable
        ];

        DB::table('sources')->insert($sources);
    }
}
