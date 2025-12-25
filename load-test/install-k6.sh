#!/bin/bash

# Install k6 on Ubuntu/Debian server
echo "Installing k6 load testing tool..."

# Add k6 GPG key
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69

# Add k6 repository
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list

# Install k6
sudo apt-get update
sudo apt-get install -y k6

# Verify installation
k6 version

echo ""
echo "k6 installed successfully!"
echo "Run tests with: k6 run k6-load-test.js"
