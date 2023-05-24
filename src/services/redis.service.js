"use strict";

const redis = require("redis");
const { promisify } = require("util");
const {
  reservationInventory,
} = require("../models/repositories/inventoty.repo");
const redisClient = redis.createClient();

const pExpire = promisify(redisClient.pExpire).bind(redisClient);
const setNxAsync = promisify(redisClient.setNX).bind(redisClient);
const delAsyncKey = promisify(redisClient.del).bind(redisClient);

const acquireLock = async (productId, quantity, cartId) => {
  const key = `lock_v2023_${productId}`;
  const retryTimes = 10;
  const expireTime = 3000; // time lock

  for (let i = 0; i < retryTimes; i++) {
    // tạo 1 key mới trong redis dựa vào tính nguyên tử của setnx
    // thằng nào giữ key này sẽ được thanh toán
    const result = await setNxAsync(key, expireTime);
    console.log(`result key lock::`, result);
    if (result === 1) {
      // chưa có key trong redis => tiến hành thao tác thanh toán
      // thao tác với inventory
      const isReservation = await reservationInventory({
        productId,
        quantity,
        cartId,
      });

      if (isReservation.modifiedCount) {
        // nếu đặt hàng thành công => giải phóng (xóa) key này sau expireTime giây => return key
        // key được xóa thì thằng khác mới có thể vào thanh toán
        await pExpire(key, expireTime);
        return key;
      }
      // dặt hàng không thành công => key = null ==> return null
      return null;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
};

const releaseLock = async (keyLock) => {
  return await delAsyncKey(keyLock);
};

module.exports = {
  acquireLock,
  releaseLock,
};
