# Connnect MongoDB to Nodejs Using Mongoose

## 1. Nhược điểm của cách connnect cũ

    - `init.mongodb.lv0.js`: khi file này được import bao nhiêu lần thì sẽ tạo bấy nhiêu connect tương ứng đên database
    - Do Nodejs và mongoose đã có cơ chế cache lại, nhưng đối với các ngôn ngữ khác thì nó sẽ tạo connect đến DB mỗi khi file được import
    - Cách tốt nhất là khởi tạo 1 instance để connect đến DB

## 2. Cách mới `init.mongodb.js` để connect đế DB thay cho cách cũ.

    - Tạo duy nhất 1 instance và export in đó để sử dụng
    - Việc làm này đúng cho cả các ngôn ngữ khác (Java, PHP ...)

## 3. Cách kiểm tra có bao nhiêu connect trong hệ thống

## 4. Kiểm tra hệ thống quá tải ?

## 5. Có nên disconnect liên tục ?

## 6. PoolSize là gì? Ưu điểm ?

    - Pool Sise: là số lượng các connection được định sẵn, sẵn sàng cho việc thực hiện yêu cầu đến DB.

## 7. Nếu User vượt quá số lượng PoolSize thì sao ?

    - Nếu vượt quá số lượng PoolSize thì user đó phải chờ cho đến khi có connnect free trong PoolSize để thực hiện yêu cầu.
