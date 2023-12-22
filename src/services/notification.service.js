const Notification = require("../models/notification.model");

class NotificationService {
  static async pushNotiToSystem({
    type = "SHOP-001",
    senderId = 1,
    receiverId = 1,
    options = {},
  }) {
    let noti_content;

    if (type === "SHOP-001") {
      noti_content = `@@@ vừa thêm một sản phẩm: @@@`;
    } else {
      noti_content = `@@@ vừa thêm một voucher mới @@@`;
    }

    const newNoti = await Notification.create({
      noti_type: type,
      noti_content,
      noti_senderId: senderId,
      noti_receiverId: receiverId,
      noti_options: options,
    });

    return newNoti;
  }

  static async listNotiByUser({ userId, type = "ALL", isRead = 0 }) {
    const match = { noti_receiverId: +userId };
    if (type !== "ALL") {
      match["noti_type"] = type;
    }

    return await Notification.aggregate([
      {
        $match: match,
      },
      {
        $project: {
          noti_type: 1,
          noti_senderId: 1,
          noti_receiverId: 1,
          noti_content: {
            $concat: [
              {
                $substr: ["$noti_options.shop_name", 0, -1],
              },
              "Vừa mới thêm 1 sản phẩm mới: ",
              {
                $substr: ["$noti_options.product_name", 0, -1],
              },
            ],
          },
          createAt: 1,
          noti_options: 1,
        },
      },
    ]);
  }
}

module.exports = NotificationService;
