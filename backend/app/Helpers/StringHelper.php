<?php
// app/Helpers/StringHelper.php

namespace App\Helpers;

class StringHelper
{
  /**
   * Normalize Unicode text (convert mathematical script characters to normal letters)
   */
  public static function normalizeUnicode(?string $value): ?string
  {
    if (empty($value)) return null;

    $unicodeMap = [
      // Mathematical Bold
      '𝐀' => 'A',
      '𝐁' => 'B',
      '𝐂' => 'C',
      '𝐃' => 'D',
      '𝐄' => 'E',
      '𝐅' => 'F',
      '𝐆' => 'G',
      '𝐇' => 'H',
      '𝐈' => 'I',
      '𝐉' => 'J',
      '𝐊' => 'K',
      '𝐋' => 'L',
      '𝐌' => 'M',
      '𝐍' => 'N',
      '𝐎' => 'O',
      '𝐏' => 'P',
      '𝐐' => 'Q',
      '𝐑' => 'R',
      '𝐒' => 'S',
      '𝐓' => 'T',
      '𝐔' => 'U',
      '𝐕' => 'V',
      '𝐖' => 'W',
      '𝐗' => 'X',
      '𝐘' => 'Y',
      '𝐙' => 'Z',
      '𝐚' => 'a',
      '𝐛' => 'b',
      '𝐜' => 'c',
      '𝐝' => 'd',
      '𝐞' => 'e',
      '𝐟' => 'f',
      '𝐠' => 'g',
      '𝐡' => 'h',
      '𝐢' => 'i',
      '𝐣' => 'j',
      '𝐤' => 'k',
      '𝐥' => 'l',
      '𝐦' => 'm',
      '𝐧' => 'n',
      '𝐨' => 'o',
      '𝐩' => 'p',
      '𝐪' => 'q',
      '𝐫' => 'r',
      '𝐬' => 's',
      '𝐭' => 't',
      '𝐮' => 'u',
      '𝐯' => 'v',
      '𝐰' => 'w',
      '𝐱' => 'x',
      '𝐲' => 'y',
      '𝐳' => 'z',

      // Mathematical Italic
      '𝐴' => 'A',
      '𝐵' => 'B',
      '𝐶' => 'C',
      '𝐷' => 'D',
      '𝐸' => 'E',
      '𝐹' => 'F',
      '𝐺' => 'G',
      '𝐻' => 'H',
      '𝐼' => 'I',
      '𝐽' => 'J',
      '𝐾' => 'K',
      '𝐿' => 'L',
      '𝑀' => 'M',
      '𝑁' => 'N',
      '𝑂' => 'O',
      '𝑃' => 'P',
      '𝑄' => 'Q',
      '𝑅' => 'R',
      '𝑆' => 'S',
      '𝑇' => 'T',
      '𝑈' => 'U',
      '𝑉' => 'V',
      '𝑊' => 'W',
      '𝑋' => 'X',
      '𝑌' => 'Y',
      '𝑍' => 'Z',
      '𝑎' => 'a',
      '𝑏' => 'b',
      '𝑐' => 'c',
      '𝑑' => 'd',
      '𝑒' => 'e',
      '𝑓' => 'f',
      '𝑔' => 'g',
      'ℎ' => 'h',
      '𝑖' => 'i',
      '𝑗' => 'j',
      '𝑘' => 'k',
      '𝑙' => 'l',
      '𝑚' => 'm',
      '𝑛' => 'n',
      '𝑜' => 'o',
      '𝑝' => 'p',
      '𝑞' => 'q',
      '𝑟' => 'r',
      '𝑠' => 's',
      '𝑡' => 't',
      '𝑢' => 'u',
      '𝑣' => 'v',
      '𝑤' => 'w',
      '𝑥' => 'x',
      '𝑦' => 'y',
      '𝑧' => 'z',

      // Script/Bold Script
      '𝓐' => 'A',
      '𝓑' => 'B',
      '𝓒' => 'C',
      '𝓓' => 'D',
      '𝓔' => 'E',
      '𝓕' => 'F',
      '𝓖' => 'G',
      '𝓗' => 'H',
      '𝓘' => 'I',
      '𝓙' => 'J',
      '𝓚' => 'K',
      '𝓛' => 'L',
      '𝓜' => 'M',
      '𝓝' => 'N',
      '𝓞' => 'O',
      '𝓟' => 'P',
      '𝓠' => 'Q',
      '𝓡' => 'R',
      '𝓢' => 'S',
      '𝓣' => 'T',
      '𝓤' => 'U',
      '𝓥' => 'V',
      '𝓦' => 'W',
      '𝓧' => 'X',
      '𝓨' => 'Y',
      '𝓩' => 'Z',
      '𝓪' => 'a',
      '𝓫' => 'b',
      '𝓬' => 'c',
      '𝓭' => 'd',
      '𝓮' => 'e',
      '𝓯' => 'f',
      '𝓰' => 'g',
      '𝓱' => 'h',
      '𝓲' => 'i',
      '𝓳' => 'j',
      '𝓴' => 'k',
      '𝓵' => 'l',
      '𝓶' => 'm',
      '𝓷' => 'n',
      '𝓸' => 'o',
      '𝓹' => 'p',
      '𝓺' => 'q',
      '𝓻' => 'r',
      '𝓼' => 's',
      '𝓽' => 't',
      '𝓾' => 'u',
      '𝓿' => 'v',
      '𝔀' => 'w',
      '𝔁' => 'x',
      '𝔂' => 'y',
      '𝔃' => 'z',
    ];

    return strtr($value, $unicodeMap);
  }

  /**
   * Format string to title case (converts "JOHN DOE" to "John Doe")
   */
  public static function toTitleCase(?string $value): ?string
  {
    if (empty($value)) return null;

    $value = self::normalizeUnicode($value);
    $value = strtolower($value);

    return ucwords($value);
  }

  /**
   * Generate random string
   */
  public static function random(int $length = 10): string
  {
    return substr(str_shuffle('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'), 0, $length);
  }

  /**
   * Truncate string with ellipsis
   */
  public static function truncate(?string $value, int $length = 100, string $ending = '...'): ?string
  {
    if (empty($value)) return null;

    if (strlen($value) <= $length) {
      return $value;
    }

    return substr($value, 0, $length) . $ending;
  }

  /**
   * Slugify string
   */
  public static function slugify(string $value): string
  {
    $value = strtolower($value);
    $value = preg_replace('/[^a-z0-9-]/', '-', $value);
    $value = preg_replace('/-+/', '-', $value);

    return trim($value, '-');
  }

  
  public static function toUpperCase(?string $value): ?string
  {
    if (empty($value)) return null;

    return strtoupper($value);
  }
}
