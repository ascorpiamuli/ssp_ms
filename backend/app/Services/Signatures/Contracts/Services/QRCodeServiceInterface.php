<?php
// app/Services/Signatures/Contracts/Services/QRCodeServiceInterface.php

namespace App\Services\Signatures\Contracts\Services;

interface QRCodeServiceInterface
{
    /**
     * Generate QR Code and save to file - Returns file path
     */
    public function generateQrCode(string $data): ?string;

    /**
     * Generate QR Code as PNG binary string
     */
    public function generatePNG(string $data, ?string $label = null, int $size = 300): string;

    /**
     * Generate QR Code as SVG string
     */
    public function generateSVG(string $data, ?string $label = null, int $size = 300): string;

    /**
     * Generate QR Code and save to storage
     */
    public function generateAndSave(string $data, string $path, ?string $label = null, int $size = 300): string;

    /**
     * Generate QR Code and save to temporary file
     */
    public function generateToTempFile(string $data, ?string $label = null, int $size = 300): string;

    /**
     * Generate QR Code data for signature verification
     */
    public function generateSignatureQRData(array $data): string;

    /**
     * Generate QR Code with verification URL
     *
     * @param string $url The clean URL to encode in the QR code
     * @return string|null The path to the generated QR image, or null on failure
     */
    public function generateQRWithVerificationUrl(string $url): ?string;

    /**
     * Get QR Code as base64
     */
    public function getBase64(string $data, ?string $label = null, int $size = 300): string;

    /**
     * Get signature QR as base64
     */
    public function getSignatureQRBase64(array $data, ?string $label = null, int $size = 300): string;

    /**
     * Generate QR Code with metadata
     */
    public function generateQRWithMetadata(array $data, ?string $label = null, int $size = 300): array;

    /**
     * Verify QR code data
     */
    public function verifyQRData(string $qrData): ?array;

    /**
     * Clean up temporary QR Code files
     */
    public function cleanupTempFiles(string $filePath): void;

    /**
     * Get QR Code as base64 from file path
     */
    public function getBase64FromFile(string $filePath): ?string;
}
