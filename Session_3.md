# Mã Hoá Token Dựa Vào JWT Và Thuật Toán RSA (Mã Hoá Bất Đối Xứng)

## 1. Mã Hoá RSA

    - Dùng 1 cặp `publicKey` và `privateKey` để mã hoá và giải mã

## 2. Cơ Chế Sinh Mã Hoá Token theo JWT và RSA

    - Dùng `pakage: crypto` để sinh ra cặp khoá `publicKey` và `privateKey`, 2 khoá này sinh ra ở dạng pem
    - Sau khi có được 2 khoá: tiến hành lưu lại publicKey ở Database và phải chuyển `publicKey` từ pem -> string (mới có thể lưu được), còn `privateKey` được dùng như là secretKey của JWT
    - Sau khi lưu `publicKey` vào Database (dùng làm key giải mã accessToken sau này)
        + do cơ chế mã hoá bất đối xứng của RSA nên khi mã hoá secretKey là `privateKey` thì khi giải mã chỉ cần dùng `publicKey` là có thể decode được Token
        + lưu ý: thuật toán mã hoá phải chọn RSA
    - dùng `privateKey` xem như secretKey kết hợp cùng với JWT để sinh token và trả về cho client

> Mỗi Người dùng khi đăng kí / đăng nhập thành công sẽ được mã hoá (accessToken) dựa vào secretKey khác nhau chứ không dùng chung 1 secretKey tự định nghĩa (cố định) từ đầu.
