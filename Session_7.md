## Xử Lý Token Bị Sử Dụng Trái Phép

# 1. Hacker có được cặp token (`accessToken và refreshToken`) của người dùng
    - thì trong thời gian `accessToken` còn hạn sử dụng thì hacker sẽ dùng được token này để lấy tài nguyên
    - đến khi `accessToken` hết hạn
    - THÌ
    - TH1: 
        > người dùng gửi `refreshToken` lên để sinh lại `accessToken`, lúc này `refreshToken` sẽ được push và `refreshTokensUsed`
        > Hacker cũng dùng `refreshToken` lên để sinh lại `accessToken`, lúc này `refreshToken` đã cũ và đang được lưu trong `refreshTokensUsed`
        > Nên sẽ xóa toàn bộ `KeyToken` của người dùng. Mục đích để người dùng đăng nhập lại