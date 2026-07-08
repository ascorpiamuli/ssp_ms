<?php

return [
  'default_font' => env('PDF_DEFAULT_FONT', 'sans-serif'),
  'allow_remote_urls' => env('PDF_ALLOW_REMOTE_URLS', false),
  'default_paper_size' => env('PDF_PAPER_SIZE', 'a4'),
  'default_orientation' => env('PDF_ORIENTATION', 'portrait'),

  'watermark' => [
    'default_text' => env('PDF_WATERMARK_TEXT', 'CONFIDENTIAL'),
    'default_opacity' => env('PDF_WATERMARK_OPACITY', 0.1),
    'default_font_size' => env('PDF_WATERMARK_FONT_SIZE', 60),
    'default_color' => env('PDF_WATERMARK_COLOR', '#000000'),
  ],

  'qr_code' => [
    'default_size' => env('PDF_QR_SIZE', 150),
    'default_position' => env('PDF_QR_POSITION', 'bottom-right'),
  ],

  'options' => [
    'dpi' => 96,
    'defaultFont' => 'sans-serif',
    'isHtml5ParserEnabled' => true,
    'isRemoteEnabled' => false,
  ],
];
