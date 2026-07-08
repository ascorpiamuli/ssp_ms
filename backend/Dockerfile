# Stage 1: Dependencies and Build
FROM php:8.4-fpm AS builder

# Install system dependencies
RUN apt-get update && apt-get install -y \
  git \
  curl \
  libpng-dev \
  libonig-dev \
  libxml2-dev \
  zip \
  unzip \
  nodejs \
  npm \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy application files
COPY . .

# Install PHP dependencies (production only)
RUN composer install --no-interaction --optimize-autoloader --no-dev

# Install and build frontend assets (if any)
RUN npm install && npm run production || true

# Set permissions
RUN chown -R www-data:www-data /var/www/html/storage \
  && chown -R www-data:www-data /var/www/html/bootstrap/cache \
  && chmod -R 755 /var/www/html/storage \
  && chmod -R 755 /var/www/html/bootstrap/cache

# Stage 2: Production Image
FROM php:8.4-fpm

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
  git \
  curl \
  libpng-dev \
  libonig-dev \
  libxml2-dev \
  zip \
  unzip \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# ============================================
# INCREASE PHP UPLOAD LIMITS (PRODUCTION)
# ============================================
RUN echo "upload_max_filesize = 20M" > /usr/local/etc/php/conf.d/99-uploads.ini \
  && echo "post_max_size = 20M" >> /usr/local/etc/php/conf.d/99-uploads.ini \
  && echo "memory_limit = 256M" >> /usr/local/etc/php/conf.d/99-uploads.ini \
  && echo "max_execution_time = 300" >> /usr/local/etc/php/conf.d/99-uploads.ini \
  && echo "max_input_time = 300" >> /usr/local/etc/php/conf.d/99-uploads.ini \
  && echo "max_file_uploads = 20" >> /usr/local/etc/php/conf.d/99-uploads.ini

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy application from builder
COPY --from=builder /var/www/html /var/www/html

# Copy .env.production to .env if it exists
RUN if [ -f .env.production ]; then cp .env.production .env; fi

# Set permissions
RUN chown -R www-data:www-data /var/www/html/storage \
  && chown -R www-data:www-data /var/www/html/bootstrap/cache

# Display PHP info for debugging (optional - remove in production)
RUN php -i | grep -E "upload_max_filesize|post_max_size|memory_limit" || true

EXPOSE 9000

CMD ["php-fpm"]
