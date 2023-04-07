## Authentication And logout

# 1. Logout
    - logout cũng phải bắt buộc truyền `accessToken` hoặc 1 cặp (`accessToken` và `refreshToken`) thì mới thực hiện logout người dùng
    - logout thành công: Xóa hết `keyStore` có liên quan đến người dùng
# 2. Authentication
    - Kiểm tra userId người dùng gửi lên (headers)
    - Kiểm tra accessToken người dùng gửi lên (headers)
    - verifyToken
    - check user in dbs
    - check keyStore with this userId
    - ok all, => return next()