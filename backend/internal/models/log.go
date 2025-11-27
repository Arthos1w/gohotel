package models

import (
	"time"
)

// Log 日志模型
// 对应数据库中的 logs 表
type Log struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Level     string    `gorm:"not null;size:20" json:"level"`
	Message   string    `gorm:"not null;type:text" json:"message"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// TableName 指定表名
func (Log) TableName() string {
	return "logs"
}

