package middleware

import (
	"gohotel/pkg/errors"
	"gohotel/pkg/utils"
	"strings"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware JWT 认证中间件
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. 从请求头获取 Authorization
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			utils.ErrorResponse(c, errors.NewUnauthorizedError("请提供认证令牌"))
			c.Abort()
			return
		}

		// 2. 检查格式：Bearer <token>
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			utils.ErrorResponse(c, errors.NewUnauthorizedError("令牌格式错误，应为: Bearer <token>"))
			c.Abort()
			return
		}

		// 3. 解析令牌
		claims, err := utils.ParseToken(parts[1])
		if err != nil {
			utils.ErrorResponse(c, errors.NewUnauthorizedError("令牌无效或已过期"))
			c.Abort()
			return
		}

		// 4. 将用户信息存入上下文
		c.Set("user_id", claims.UserID)
		c.Set("username", claims.Username)

		// 5. 继续处理请求
		c.Next()
	}
}

// AdminMiddleware 管理员权限中间件
// 注意：必须在 AuthMiddleware 之后使用
func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 从上下文获取用户信息
		// 注：这里简化处理，实际应该从数据库查询用户角色
		// 或者在 JWT 中包含角色信息

		// 暂时允许所有已认证用户访问
		// TODO: 实现真正的角色检查
		c.Next()
	}
}


