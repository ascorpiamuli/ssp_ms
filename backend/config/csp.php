<?php

use Spatie\Csp\Directive;
use Spatie\Csp\Keyword;
use Spatie\Csp\Value;

return [

  /*
     * ============================================================================
     * WHAT IS CSP (Content Security Policy)?
     * ============================================================================
     *
     * CSP is a security header that tells the browser WHAT resources it can load
     * and WHERE from. It's like a bouncer at a club - only allowing trusted
     * sources to enter your website.
     *
     * WHY DO WE NEED IT?
     * - Prevents XSS (Cross-Site Scripting) attacks
     * - Blocks malicious scripts injected by hackers
     * - Stops data theft from your users
     *
     * HOW IT WORKS:
     * Browser: "Can I run this script?"
     * CSP: "Only if it comes from your domain or Google"
     * Browser: Blocks anything else!
     *
     * ============================================================================
     */

  /*
     * PRESETS - Pre-configured security rules
     * Basic::class = Good default security for most apps
     *
     * Other options:
     * - Laravel::class = Optimized for Laravel
     * - Custom::class = You define everything
     */
  'presets' => [
    Spatie\Csp\Presets\Basic::class,
  ],

  /*
     * DIRECTIVES - Specific rules for different resource types
     * Each directive controls a different type of content
     */
  'directives' => [

    /*
         * DEFAULT - Fallback rule for everything not specified below
         * 'self' = Only allow resources from your own domain
         */
    [Directive::DEFAULT, [Keyword::SELF]],

    /*
         * SCRIPT - Controls JavaScript execution (MOST IMPORTANT for XSS)
         *
         * 'self' = Allow scripts from your domain
         * 'unsafe-inline' = Allow scripts inside HTML (needed for Next.js)
         * 'unsafe-eval' = Allow eval() function (needed for Next.js dev)
         * https: = Allow scripts from any HTTPS website
         */
    [Directive::SCRIPT, [
      Keyword::SELF,
      Keyword::UNSAFE_INLINE,
      Keyword::UNSAFE_EVAL,
      'https://www.google.com',
      'https://www.gstatic.com',
    ]],

    /*
         * STYLE - Controls CSS files
         * 'unsafe-inline' needed for Tailwind CSS to work
         */
    [Directive::STYLE, [
      Keyword::SELF,
      Keyword::UNSAFE_INLINE,
      'https://fonts.googleapis.com',
    ]],

    /*
         * IMG - Controls images
         * data: = Allow inline images (base64)
         * https: = Allow images from any HTTPS source
         * blob: = Allow images from blob URLs (file uploads)
         */
    [Directive::IMG, [
      Keyword::SELF,
      'data:',
      'https:',
      'blob:',
    ]],

    /*
         * FONT - Controls web fonts
         */
    [Directive::FONT, [
      Keyword::SELF,
      'data:',
      'https://fonts.gstatic.com',
    ]],

    /*
         * CONNECT - Controls API calls, AJAX, WebSockets
         * CRITICAL for your app to communicate with backend
         */
    [Directive::CONNECT, [
      Keyword::SELF,
      'https://api.tumcathcom.com',
      'https://office.tumcathcom.com',
    ]],

    /*
         * FRAME_ANCESTORS - Prevents clickjacking attacks
         * 'none' = Cannot be embedded in any iframe
         * This stops hackers from putting your site in a hidden iframe
         */
    [Directive::FRAME_ANCESTORS, [Keyword::NONE]],

    /*
         * FORM_ACTION - Controls where forms can submit data
         * Prevents your forms from sending data to hacker websites
         */
    [Directive::FORM_ACTION, [Keyword::SELF]],

    /*
         * OBJECT - Blocks Flash, Java applets, plugins
         * These are outdated and dangerous
         */
    [Directive::OBJECT, [Keyword::NONE]],

    /*
         * UPGRADE_INSECURE_REQUESTS - Automatically converts HTTP to HTTPS
         * Forces all requests to use secure connections
         */
    [Directive::UPGRADE_INSECURE_REQUESTS, Value::NO_VALUE],

    /*
         * BLOCK_ALL_MIXED_CONTENT - Blocks HTTP content on HTTPS pages
         * Prevents insecure resources on secure pages
         */
    [Directive::BLOCK_ALL_MIXED_CONTENT, Value::NO_VALUE],
  ],

  /*
     * REPORT ONLY MODE - Test new rules without breaking your site
     *
     * Use this when you want to:
     * - Test if a new policy will break anything
     * - Monitor what would be blocked
     * - Gradually roll out stricter security
     *
     * How to use:
     * 1. Add your test preset here
     * 2. Monitor the reports
     * 3. Fix any issues
     * 4. Move to live directives
     */
  'report_only_presets' => [
    // Example: Uncomment to test stricter policy
    // App\Csp\StrictPreset::class,
  ],

  /*
     * Report-only directives for testing
     */
  'report_only_directives' => [
    // Example: Test blocking inline scripts
     [Directive::SCRIPT, [Keyword::SELF]],
  ],

  /*
     * REPORT URI - Where to send violation reports
     *
     * Set up an endpoint to receive CSP violation reports
     * Great for monitoring attacks and debugging issues
     *
     * Services you can use:
     * - https://report-uri.com (free tier available)
     * - Your own endpoint: /api/csp-report
     */
  'report_uri' => env('CSP_REPORT_URI', ''),

  /*
     * MASTER SWITCH - Turn CSP on/off
     *
     * Set to false if:
     * - You're debugging a CSP issue
     * - A third-party service is breaking
     * - During development (temporarily)
     */
  'enabled' => env('CSP_ENABLED', true),

  /*
     * HOT RELOADING SUPPORT - For Vite development
     * Keep false in production
     */
  'enabled_while_hot_reloading' => env('CSP_ENABLED_WHILE_HOT_RELOADING', false),

  /*
     * NONCE GENERATOR - Creates unique tokens for inline scripts
     *
     * A nonce = "number used once" - a random token
     * How it works:
     * 1. Server generates random token
     * 2. Adds to CSP header: script-src 'nonce-RANDOM123'
     * 3. Adds same token to script tag: <script nonce="RANDOM123">
     * 4. Browser only executes scripts with matching nonce
     *
     * This allows specific inline scripts while blocking all others!
     */
  'nonce_generator' => Spatie\Csp\Nonce\RandomString::class,

  /*
     * ENABLE NONCES - Use unique tokens for inline scripts
     *
     * Set to true = More secure (blocks all inline scripts without nonce)
     * Set to false = Less secure but works with 'unsafe-inline'
     *
     * For Next.js, you usually need 'unsafe-inline', so keep this false
     */
  'nonce_enabled' => env('CSP_NONCE_ENABLED', false), // Set to false for Next.js
];
