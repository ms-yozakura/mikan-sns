export function validateUsername(username: string): string | null {
  if (username.length < 3) {
    return 'ユーザーIDは3文字以上で入力してください'
  }

  if (username.length > 20) {
    return 'ユーザーIDは20文字以下で入力してください'
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return 'ユーザーIDは英数字と_のみ使用できます'
  }

  return null
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return 'パスワードは8文字以上にしてください'
  }

  if (password.length > 64) {
    return 'パスワードは64文字以下にしてください'
  }

  return null
}
