<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Department;

class DepartmentSeeder extends Seeder
{
  public function run(): void
  {
    $departments = [
      ['name' => 'Mathematics Department', 'code' => 'MATH-001', 'description' => 'Mathematics and Statistics'],
      ['name' => 'English Department', 'code' => 'ENG-001', 'description' => 'English Language and Literature'],
      ['name' => 'Science Department', 'code' => 'SCI-001', 'description' => 'Physical and Biological Sciences'],
      ['name' => 'Humanities Department', 'code' => 'HUM-001', 'description' => 'History, Philosophy, and Religion'],
      ['name' => 'Business Studies Department', 'code' => 'BUS-001', 'description' => 'Business Administration and Economics'],
      ['name' => 'ICT Department', 'code' => 'ICT-001', 'description' => 'Information and Communication Technology'],
      ['name' => 'Agriculture Department', 'code' => 'AGR-001', 'description' => 'Agricultural Sciences'],
      ['name' => 'Sports Department', 'code' => 'SPT-001', 'description' => 'Physical Education and Sports'],
      ['name' => 'Finance Department', 'code' => 'FIN-001', 'description' => 'Finance and Accounting'],
      ['name' => 'Administration Department', 'code' => 'ADM-001', 'description' => 'School Administration and Management'],
    ];

    foreach ($departments as $department) {
      Department::create($department);
    }
  }
}
