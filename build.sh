#!/usr/bin/env bash

# Exit on error
set -e

# Install system dependencies for better-sqlite3
apt-get update
apt-get install -y python3 build-essential

# Install npm dependencies
npm install

# Build the Next.js application
npm run build