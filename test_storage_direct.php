<?php
// test_storage_direct.php

$basePath = '/var/www/html/storage/app/public/uploads';
$testDir = $basePath . '/test';
$testFile = $testDir . '/test_' . time() . '.txt';

echo "Testing storage at: $basePath\n\n";

// Check if base directory exists
if (is_dir($basePath)) {
    echo "✓ Base directory exists: $basePath\n";
    echo "  Permissions: " . substr(sprintf('%o', fileperms($basePath)), -4) . "\n";
} else {
    echo "✗ Base directory does not exist!\n";
    exit(1);
}

// Create test directory
if (!is_dir($testDir)) {
    if (mkdir($testDir, 0777, true)) {
        echo "✓ Created test directory: $testDir\n";
    } else {
        echo "✗ Failed to create test directory: $testDir\n";
        exit(1);
    }
} else {
    echo "✓ Test directory exists: $testDir\n";
}

// Write test file
$content = "Test content written at " . date('Y-m-d H:i:s') . "\n";
if (file_put_contents($testFile, $content) !== false) {
    echo "✓ Successfully wrote test file: $testFile\n";
    echo "  File size: " . filesize($testFile) . " bytes\n";
    echo "  Content: " . file_get_contents($testFile) . "\n";
    echo "  File permissions: " . substr(sprintf('%o', fileperms($testFile)), -4) . "\n";
} else {
    echo "✗ Failed to write test file: $testFile\n";
}

// List the directory contents
echo "\nDirectory contents:\n";
$files = scandir($testDir);
foreach ($files as $file) {
    if ($file !== '.' && $file !== '..') {
        echo "  - $file\n";
    }
}
