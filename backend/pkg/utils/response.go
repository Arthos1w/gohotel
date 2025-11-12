package utils

import (
	"gohotel/pkg/errors"

	"github.com/gin-gonic/gin"
)

// Response 统一响应格式
type Response struct {
	Success bool        `json:"success"`           // 是否成功
	Data    interface{} `json:"data,omitempty"`    // 返回的数据
	Message string      `json:"message,omitempty"` // 提示消息
	Error   *ErrorInfo  `json:"error,omitempty"`   // 错误信息
}

// ErrorInfo 错误信息结构
type ErrorInfo struct {
	Code    string `json:"code"`    // 错误代码
	Message string `json:"message"` // 错误消息
}

// SuccessResponse 返回成功响应
// 使用示例：utils.SuccessResponse(c, user)
func SuccessResponse(c *gin.Context, data interface{}) {
	c.JSON(200, Response{
		Success: true,
		Data:    data,
	})
}

// SuccessWithMessage 返回成功响应（带消息）
// 使用示例：utils.SuccessWithMessage(c, "注册成功", user)
func SuccessWithMessage(c *gin.Context, message string, data interface{}) {
	c.JSON(200, Response{
		Success: true,
		Message: message,
		Data:    data,
	})
}

// ErrorResponse 返回错误响应
// 使用示例：utils.ErrorResponse(c, errors.NewNotFoundError("用户不存在"))
func ErrorResponse(c *gin.Context, err error) {
	// 检查是否是自定义错误
	if appErr, ok := err.(errors.AppError); ok {
		c.JSON(appErr.StatusCode(), Response{
			Success: false,
			Error: &ErrorInfo{
				Code:    appErr.ErrorCode(),
				Message: appErr.ErrorMessage(),
			},
		})
		return
	}

	// 如果不是自定义错误，返回 500
	c.JSON(500, Response{
		Success: false,
		Error: &ErrorInfo{
			Code:    "UNKNOWN_ERROR",
			Message: err.Error(),
		},
	})
}

// ========== 分页响应 ==========

// PageInfo 分页信息
type PageInfo struct {
	Page       int   `json:"page"`        // 当前页码
	PageSize   int   `json:"page_size"`   // 每页数量
	Total      int64 `json:"total"`       // 总记录数
	TotalPages int   `json:"total_pages"` // 总页数
}

// PageResponse 分页响应
type PageResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data"`
	Page    PageInfo    `json:"page"`
}

// SuccessWithPage 返回分页响应
func SuccessWithPage(c *gin.Context, data interface{}, page int, pageSize int, total int64) {
	totalPages := int(total) / pageSize
	if int(total)%pageSize != 0 {
		totalPages++
	}

	c.JSON(200, PageResponse{
		Success: true,
		Data:    data,
		Page: PageInfo{
			Page:       page,
			PageSize:   pageSize,
			Total:      total,
			TotalPages: totalPages,
		},
	})
}







