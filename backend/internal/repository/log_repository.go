package repository

import (
	"gohotel/internal/models"

	"gorm.io/gorm"
)

// LogRepository 日志数据访问层
type LogRepository struct {
	db *gorm.DB
}

// NewLogRepository 创建日志仓库实例
func NewLogRepository(db *gorm.DB) *LogRepository {
	return &LogRepository{db: db}
}

// Create 创建单条日志
func (r *LogRepository) Create(log *models.Log) error {
	return r.db.Create(log).Error
}

// BatchCreate 批量创建日志
func (r *LogRepository) BatchCreate(logs []*models.Log) error {
	if len(logs) == 0 {
		return nil
	}
	return r.db.Create(&logs).Error
}

// GetByID 根据 ID 获取日志
func (r *LogRepository) GetByID(id uint) (*models.Log, error) {
	var log models.Log
	err := r.db.First(&log, id).Error
	if err != nil {
		return nil, err
	}
	return &log, nil
}

// GetLogs 分页获取日志列表
func (r *LogRepository) GetLogs(page, pageSize int) ([]models.Log, int64, error) {
	var logs []models.Log
	var total int64

	// 计算偏移量
	offset := (page - 1) * pageSize

	// 获取总数
	if err := r.db.Model(&models.Log{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 获取分页数据（按创建时间倒序）
	if err := r.db.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&logs).Error; err != nil {
		return nil, 0, err
	}

	return logs, total, nil
}

// Delete 删除日志
func (r *LogRepository) Delete(id uint) error {
	return r.db.Delete(&models.Log{}, id).Error
}
