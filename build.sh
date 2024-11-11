#!/usr/bin/env bash

# Exit on error
set -e

# Install system dependencies for better-sqlite3
apt-get update
apt-get install -y python3 build-essential

# Create cache directory
mkdir -p .next/cache

# Install npm dependencies
npm ci

# Build the Next.js application
npm run build