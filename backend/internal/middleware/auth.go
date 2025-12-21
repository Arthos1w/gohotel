package middleware

import (
	stderrors "errors"
	"gohotel/pkg/errors"
	"gohotel/pkg/utils"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
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
			if stderrors.Is(err, jwt.ErrTokenExpired) {
				utils.ErrorResponse(c, errors.NewUnauthorizedError("令牌已过期"))
				c.Abort()
				return
			}
			if stderrors.Is(err, jwt.ErrSignatureInvalid) {
				utils.ErrorResponse(c, errors.NewUnauthorizedError("令牌签名无效"))
				c.Abort()
				return
			}
			utils.ErrorResponse(c, errors.NewUnauthorizedError("令牌无效"))
			c.Abort()
			return
		}

		// 4. 将用户信息存入上下文
		c.Set("user_id", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("role", claims.Role)

		// 5. 继续处理请求
		c.Next()
	}
}

// AdminMiddleware 管理员权限中间件
// 注意：必须在 AuthMiddleware 之后使用
func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		roleAny, exists := c.Get("role")
		if !exists {
			utils.ErrorResponse(c, errors.NewUnauthorizedError("未登录"))
			c.Abort()
			return
		}

		role, ok := roleAny.(string)
		if !ok || role == "" {
			utils.ErrorResponse(c, errors.NewUnauthorizedError("无效的登录信息"))
			c.Abort()
			return
		}

		if role != "admin" {
			utils.ErrorResponse(c, errors.NewForbiddenError("需要管理员权限"))
			c.Abort()
			return
		}

		c.Next()
	}
}
