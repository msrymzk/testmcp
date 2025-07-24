import * as fs from 'fs';
import * as path from 'path';

export class MCPLogger {
  private logFile: string;
  private logDir: string;

  constructor(logFileName: string = 'mcp-server.log') {
    // Claude Desktop実行時のprocess.cwd()問題を回避
    const homeDir = process.env.HOME || '/tmp';
    this.logDir = path.join(homeDir, '.mcp-logs');
    this.logFile = path.join(this.logDir, logFileName);
    this.ensureLogDirectory();
  }

  private ensureLogDirectory() {
    try {
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }
    } catch (error) {
      // ログディレクトリ作成に失敗した場合はconsole.errorのみ使用
      console.error('[MCP-LOG] Failed to create log directory:', error instanceof Error ? error.message : String(error));
    }
  }

  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `${timestamp} [${level.toUpperCase()}] ${message}\n`;
  }

  log(level: 'info' | 'error' | 'debug' | 'warn', message: string, data?: any) {
    const logMessage = data 
      ? this.formatMessage(level, `${message} ${JSON.stringify(data, null, 2)}`)
      : this.formatMessage(level, message);

    // ファイルに出力（エラー時は無視）
    try {
      fs.appendFileSync(this.logFile, logMessage);
    } catch (error) {
      // ファイル書き込み失敗は無視してconsole.errorのみ使用
    }
    
    // console.errorにも出力（Claude Desktopで確認可能）
    console.error(`[MCP-LOG] ${logMessage.trim()}`);
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  // ログファイルのパスを取得
  getLogFilePath(): string {
    return this.logFile;
  }

  // ログファイルの内容を読み取り
  readLogs(lines: number = 50): string {
    try {
      if (!fs.existsSync(this.logFile)) {
        return 'ログファイルが見つかりません';
      }

      const content = fs.readFileSync(this.logFile, 'utf-8');
      const allLines = content.split('\n');
      const lastLines = allLines.slice(-lines).join('\n');
      
      return lastLines;
    } catch (error) {
      return 'ログファイル読み取りエラー';
    }
  }

  // ログファイルをクリア
  clearLogs() {
    try {
      if (fs.existsSync(this.logFile)) {
        fs.writeFileSync(this.logFile, '');
      }
    } catch (error) {
      // ファイル操作エラーは無視
    }
  }
}

// MCPリクエスト/レスポンスログのためのユーティリティ関数
export interface MCPLogConfig {
  maxDataLength?: number;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

const DEFAULT_LOG_CONFIG: MCPLogConfig = {
  maxDataLength: 1000,
  logLevel: (process.env.MCP_LOG_LEVEL as any) || 'info'
};

export function logMCPRequest(
  handlerName: string, 
  request: any, 
  config: MCPLogConfig = DEFAULT_LOG_CONFIG
) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(2, 11);
  
  const truncatedRequest = truncateData(request, config.maxDataLength || 1000);
  
  mcpLogger.info(`[${requestId}] MCP Request: ${handlerName}`, {
    requestId,
    handler: handlerName,
    timestamp: new Date().toISOString(),
    request: truncatedRequest
  });
  
  return { requestId, startTime };
}

export function logMCPResponse(
  handlerName: string,
  requestId: string,
  startTime: number,
  response: any,
  error?: Error,
  config: MCPLogConfig = DEFAULT_LOG_CONFIG
) {
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  if (error) {
    mcpLogger.error(`[${requestId}] MCP Error: ${handlerName}`, {
      requestId,
      handler: handlerName,
      duration: `${duration}ms`,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      }
    });
  } else {
    const truncatedResponse = truncateData(response, config.maxDataLength || 1000);
    
    mcpLogger.info(`[${requestId}] MCP Response: ${handlerName}`, {
      requestId,
      handler: handlerName,
      duration: `${duration}ms`,
      response: truncatedResponse
    });
  }
}

function truncateData(data: any, maxLength: number): any {
  if (typeof data === 'string') {
    return data.length > maxLength ? data.substring(0, maxLength) + '...' : data;
  }
  
  if (data === null || data === undefined) {
    return data;
  }
  
  try {
    const jsonString = JSON.stringify(data, null, 2);
    if (jsonString.length > maxLength) {
      return JSON.stringify(data) + ' [TRUNCATED]';
    }
    return data;
  } catch (error) {
    return '[CANNOT_SERIALIZE]';
  }
}

// グローバルなロガーインスタンス
export const mcpLogger = new MCPLogger();