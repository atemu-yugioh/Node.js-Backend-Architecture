const { OK } = require("../core/success.response");
const NotificationService = require("../services/notification.service");

class NotificationController {
  getListByUser = async (req, res, next) => {
    new OK({
      message: "success",
      metaData: await NotificationService.listNotiByUser({ ...req.query }),
    }).send(res);
  };
}

module.exports = new NotificationController();
