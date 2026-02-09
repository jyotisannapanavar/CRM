<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CampaignSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $campaigns = [
            [
                'name' => 'Spring Sale',
                'campaign_code' => 'SPR',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Summer Promotion',
                'campaign_code' => 'SUM',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Black Friday Campaign',
                'campaign_code' => 'BF',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'New Year Special',
                'campaign_code' => 'NYS',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Customer Loyalty Program',
                'campaign_code' => 'CLP',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Email Marketing Campaign',
                'campaign_code' => null, // Example of nullable campaign_code
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Social Media Awareness',
                'campaign_code' => 'SMA',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Referral Program',
                'campaign_code' => 'REF',
                'created_at' => now(),
                'updated_at' => now()
            ],
        ];

        DB::table('campaigns')->insert($campaigns);
    }
}
