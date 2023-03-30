# Những folders và package cần thiết khi khởi tạo Project

## 1. Khởi tạo server.js, app.js và các folders trong Project

1. tạo forlder `src` và file `server.js`
   - `src`: chứa source code của dự án
   - `server.js`: file dùng để start/stop server
2. `npm init -y`: khởi tạo dự án sinh ra file package.json
3. Tạo file `.evn` cùng cấp với folders `src` chứa các biến môi trường 'DEV', 'PRODUCTION'
4. `npm i express --save`
5. Tạo folders: `controllers`, `services`, `models`, `utils`

## 2. Khởi tạo và start server 

1. trong folder `src` tạo file `app.js`
   - tạo ứng dụng express
   - tạo middleware
   - tạo database
   - tạo routes
   - handling error

2. Các package được sử dụng
   - morgan: show thông tin request/response
      `GET / 200 2.524 ms`
   - helmet: bảo vệ header request tránh khỏi hacker
   - compression: nén data lại để gửi đi (dung lượng file gửi tới client nhỏ => nhanh)
3. Dùng `node server.js` để  start server 
   > file `server.js` chỉ dùng để start server không làm bất cứ config nào trong file này
