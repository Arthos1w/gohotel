package database

import (
	"fmt"
	"log"

	"gohotel/internal/config"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// DB 全局数据库连接对象
var DB *gorm.DB

// InitMySQL 初始化 MySQL 连接
// 这个函数会：
// 1. 连接到 MySQL 数据库
// 2. 配置连接池参数（支持高并发）
// 3. 设置日志级别
func InitMySQL() error {
	var err error

	// 获取数据库连接字符串 (DSN)
	// 格式：root:password@tcp(localhost:3306)/hotel?charset=utf8mb4&parseTime=True&loc=Local
	dsn := config.AppConfig.GetDSN()

	// 配置 GORM
	gormConfig := &gorm.Config{
		// 日志级别
		// Silent: 不输出任何日志
		// Error: 只输出错误日志
		// Warn: 输出警告和错误日志
		// Info: 输出所有日志（包括 SQL 语句）
		Logger: logger.Default.LogMode(logger.Info),

		// 禁用外键约束（为了性能）
		// 在高并发场景下，外键约束会降低性能
		// 我们在应用层保证数据一致性
		DisableForeignKeyConstraintWhenMigrating: true,
	}

	// 连接数据库
	DB, err = gorm.Open(mysql.Open(dsn), gormConfig)
	if err != nil {
		return fmt.Errorf("连接数据库失败: %w", err)
	}

	// 获取底层的 *sql.DB 对象（用于配置连接池）
	sqlDB, err := DB.DB()
	if err != nil {
		return fmt.Errorf("获取数据库实例失败: %w", err)
	}

	// ========== 配置连接池参数（这是高并发的关键）==========

	// SetMaxIdleConns 设置空闲连接池中的最大连接数
	// 空闲连接：已经建立但暂时没有使用的连接
	// 作用：避免频繁创建和销毁连接
	// 推荐值：10-20
	sqlDB.SetMaxIdleConns(config.AppConfig.Database.MaxIdleConns)

	// SetMaxOpenConns 设置数据库的最大打开连接数
	// 打开连接：包括正在使用的和空闲的所有连接
	// 作用：限制同时连接数据库的最大数量，避免数据库过载
	// 推荐值：100-1000（根据数据库服务器配置）
	sqlDB.SetMaxOpenConns(config.AppConfig.Database.MaxOpenConns)

	// SetConnMaxLifetime 设置连接的最大生存时间
	// 作用：定期回收长时间运行的连接，避免连接泄漏
	// 推荐值：1小时
	sqlDB.SetConnMaxLifetime(config.AppConfig.Database.ConnMaxLifetime)

	// 测试连接
	if err := sqlDB.Ping(); err != nil {
		return fmt.Errorf("数据库连接测试失败: %w", err)
	}

	log.Println("✅ MySQL 数据库连接成功！")
	log.Printf("📊 连接池配置: MaxIdleConns=%d, MaxOpenConns=%d",
		config.AppConfig.Database.MaxIdleConns,
		config.AppConfig.Database.MaxOpenConns)

	return nil
}

// GetDB 获取数据库连接
// 其他包可以调用这个函数获取数据库连接
func GetDB() *gorm.DB {
	return DB
}

// CloseDB 关闭数据库连接
// 应用退出时调用
func CloseDB() error {
	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}
