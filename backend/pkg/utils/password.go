package utils

import (
	"golang.org/x/crypto/bcrypt"
)

// HashPassword 加密密码
// 使用 bcrypt 算法加密密码（单向加密，无法解密）
// 参数：明文密码
// 返回：加密后的密码、错误
func HashPassword(password string) (string, error) {
	// bcrypt.DefaultCost 表示加密强度（值越大越安全但越慢）
	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashedBytes), nil
}

// CheckPassword 验证密码
// 比较明文密码和加密密码是否匹配
// 参数：明文密码、加密后的密码
// 返回：是否匹配
func CheckPassword(password, hashedPassword string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	return err == nil
}

