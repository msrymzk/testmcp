#!/bin/bash

# Test MCP Server起動スクリプト
# Claude Desktopで使用するためのスクリプト

cd "$(dirname "$0")"

# TypeScriptをコンパイル
echo "Building TypeScript..."
npm run build

if [ $? -ne 0 ]; then
    echo "Error: Build failed"
    exit 1
fi

# サーバーを起動
echo "Starting Test MCP Server..."
exec node dist/server.js