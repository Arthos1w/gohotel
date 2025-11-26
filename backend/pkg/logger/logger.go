package logger

import (
	"os"
	"sync"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"gopkg.in/natefinch/lumberjack.v2"
)

var (
	Log  *zap.Logger
	once sync.Once
)

// LogConfig 日志配置
type LogConfig struct {
	Level      string // 日志级别: debug, info, warn, error
	Filename   string // 日志文件路径
	MaxSize    int    // 单个文件最大大小(MB)
	MaxBackups int    // 保留旧文件数量
	MaxAge     int    // 保留天数
	Compress   bool   // 是否压缩
	Console    bool   // 是否输出到控制台
}

// DefaultConfig 返回默认配置
func DefaultConfig() *LogConfig {
	return &LogConfig{
		Level:      "info",
		Filename:   "logs/app.log",
		MaxSize:    100,
		MaxBackups: 3,
		MaxAge:     7,
		Compress:   true,
		Console:    true,
	}
}

// Init 初始化日志
func Init(cfg *LogConfig) error {
	var err error
	once.Do(func() {
		if cfg == nil {
			cfg = DefaultConfig()
		}

		// 解析日志级别
		level := parseLevel(cfg.Level)

		// 编码器配置
		encoderConfig := zapcore.EncoderConfig{
			TimeKey:        "time",
			LevelKey:       "level",
			NameKey:        "logger",
			CallerKey:      "caller",
			FunctionKey:    zapcore.OmitKey,
			MessageKey:     "msg",
			StacktraceKey:  "stacktrace",
			LineEnding:     zapcore.DefaultLineEnding,
			EncodeLevel:    zapcore.LowercaseLevelEncoder,
			EncodeTime:     zapcore.ISO8601TimeEncoder,
			EncodeDuration: zapcore.SecondsDurationEncoder,
			EncodeCaller:   zapcore.ShortCallerEncoder,
		}

		// 创建核心
		var cores []zapcore.Core

		// 文件输出（JSON 格式，便于日志分析）
		if cfg.Filename != "" {
			fileWriter := &lumberjack.Logger{
				Filename:   cfg.Filename,
				MaxSize:    cfg.MaxSize,
				MaxBackups: cfg.MaxBackups,
				MaxAge:     cfg.MaxAge,
				Compress:   cfg.Compress,
			}
			fileCore := zapcore.NewCore(
				zapcore.NewJSONEncoder(encoderConfig),
				zapcore.AddSync(fileWriter),
				level,
			)
			cores = append(cores, fileCore)
		}

		// 控制台输出（彩色格式，便于开发调试）
		if cfg.Console {
			consoleEncoderConfig := encoderConfig
			consoleEncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
			consoleCore := zapcore.NewCore(
				zapcore.NewConsoleEncoder(consoleEncoderConfig),
				zapcore.AddSync(os.Stdout),
				level,
			)
			cores = append(cores, consoleCore)
		}

		// 组合多个核心
		core := zapcore.NewTee(cores...)

		// 创建 Logger
		Log = zap.New(core, zap.AddCaller(), zap.AddCallerSkip(1))
	})
	return err
}

// parseLevel 解析日志级别
func parseLevel(level string) zapcore.Level {
	switch level {
	case "debug":
		return zapcore.DebugLevel
	case "info":
		return zapcore.InfoLevel
	case "warn":
		return zapcore.WarnLevel
	case "error":
		return zapcore.ErrorLevel
	default:
		return zapcore.InfoLevel
	}
}

// Sync 刷新日志缓冲区（程序退出前调用）
func Sync() {
	if Log != nil {
		_ = Log.Sync()
	}
}

// ========== 便捷方法 ==========

func Debug(msg string, fields ...zap.Field) {
	Log.Debug(msg, fields...)
}

func Info(msg string, fields ...zap.Field) {
	Log.Info(msg, fields...)
}

func Warn(msg string, fields ...zap.Field) {
	Log.Warn(msg, fields...)
}

func Error(msg string, fields ...zap.Field) {
	Log.Error(msg, fields...)
}

func Fatal(msg string, fields ...zap.Field) {
	Log.Fatal(msg, fields...)
}

// WithFields 返回带有预设字段的 Logger
func WithFields(fields ...zap.Field) *zap.Logger {
	return Log.With(fields...)
}
