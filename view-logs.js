#!/usr/bin/env node

// ログ確認用スクリプト
const fs = require('fs');
const path = require('path');

const HOME_DIR = process.env.HOME || '/tmp';
const LOGS_DIR = path.join(HOME_DIR, '.mcp-logs');
const LOG_FILE = path.join(LOGS_DIR, 'mcp-server.log');

function viewLogs() {
  console.log('=== MCP Server ログビューワー ===\n');
  
  if (!fs.existsSync(LOG_FILE)) {
    console.log('❌ ログファイルが見つかりません:');
    console.log(`   ${LOG_FILE}`);
    console.log('\n💡 サーバーを起動してから再度確認してください');
    return;
  }

  const stats = fs.statSync(LOG_FILE);
  const lastModified = stats.mtime.toLocaleString('ja-JP');
  
  console.log('📄 ログファイル情報:');
  console.log(`   場所: ${LOG_FILE}`);
  console.log(`   サイズ: ${(stats.size / 1024).toFixed(2)} KB`);
  console.log(`   最終更新: ${lastModified}\n`);

  const content = fs.readFileSync(LOG_FILE, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    console.log('📝 ログファイルは空です');
    return;
  }

  console.log(`📋 最新の ${Math.min(20, lines.length)} 行:\n`);
  console.log('─'.repeat(80));
  
  const lastLines = lines.slice(-20);
  lastLines.forEach((line, index) => {
    if (line.includes('[ERROR]')) {
      console.log(`🔴 ${line}`);
    } else if (line.includes('[WARN]')) {
      console.log(`🟡 ${line}`);
    } else if (line.includes('[DEBUG]')) {
      console.log(`🔍 ${line}`);
    } else {
      console.log(`ℹ️  ${line}`);
    }
  });
  
  console.log('─'.repeat(80));
  console.log(`\n💬 ログエントリ総数: ${lines.length}`);
  
  // エラーや警告の数をカウント
  const errors = lines.filter(line => line.includes('[ERROR]')).length;
  const warnings = lines.filter(line => line.includes('[WARN]')).length;
  const debug = lines.filter(line => line.includes('[DEBUG]')).length;
  
  if (errors > 0) console.log(`🔴 エラー: ${errors} 件`);
  if (warnings > 0) console.log(`🟡 警告: ${warnings} 件`);
  if (debug > 0) console.log(`🔍 デバッグ: ${debug} 件`);
}

function watchLogs() {
  console.log('🔄 ログファイルを監視中... (Ctrl+C で終了)\n');
  
  if (!fs.existsSync(LOG_FILE)) {
    console.log('❌ ログファイルが見つかりません');
    return;
  }

  let lastSize = 0;
  
  setInterval(() => {
    try {
      const stats = fs.statSync(LOG_FILE);
      if (stats.size > lastSize) {
        const content = fs.readFileSync(LOG_FILE, 'utf-8');
        const newContent = content.slice(lastSize);
        const newLines = newContent.split('\n').filter(line => line.trim());
        
        newLines.forEach(line => {
          const timestamp = new Date().toLocaleTimeString('ja-JP');
          if (line.includes('[ERROR]')) {
            console.log(`[${timestamp}] 🔴 ${line}`);
          } else if (line.includes('[WARN]')) {
            console.log(`[${timestamp}] 🟡 ${line}`);
          } else if (line.includes('[DEBUG]')) {
            console.log(`[${timestamp}] 🔍 ${line}`);
          } else {
            console.log(`[${timestamp}] ℹ️  ${line}`);
          }
        });
        
        lastSize = stats.size;
      }
    } catch (error) {
      console.error('ログ監視エラー:', error.message);
    }
  }, 1000);
}

// コマンドライン引数を処理
const args = process.argv.slice(2);

if (args.includes('--watch') || args.includes('-w')) {
  watchLogs();
} else if (args.includes('--help') || args.includes('-h')) {
  console.log('MCP Server ログビューワー\n');
  console.log('使用方法:');
  console.log('  node view-logs.js        # 最新のログを表示');
  console.log('  node view-logs.js -w     # リアルタイム監視');
  console.log('  node view-logs.js --help # ヘルプを表示');
} else {
  viewLogs();
}