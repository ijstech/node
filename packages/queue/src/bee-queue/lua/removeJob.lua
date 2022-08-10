--[[
/*!-----------------------------------------------------------
* Original work Copyright (c) 2015 Lewis J Ellis
* Subsequent revisions Copyright (c) 2017 Mixmax, Inc and Lewis J Ellis
* Released under MIT license
* https://github.com/bee-queue/bee-queue/blob/master/LICENSE
*-----------------------------------------------------------*/

https://github.com/bee-queue/bee-queue/blob/1c2fb849708881408fe22c6527e3f62c33a58755/lib/lua/removeJob.lua
]]

--[[
key 1 -> bq:test:succeeded
key 2 -> bq:test:failed
key 3 -> bq:test:waiting
key 4 -> bq:test:active
key 5 -> bq:test:stalling
key 6 -> bq:test:jobs
key 7 -> bq:test:delayed
arg 1 -> jobId
]]

local jobId = ARGV[1]

if (redis.call("sismember", KEYS[1], jobId) + redis.call("sismember", KEYS[2], jobId)) == 0 then
  redis.call("lrem", KEYS[3], 0, jobId)
  redis.call("lrem", KEYS[4], 0, jobId)
end

redis.call("srem", KEYS[1], jobId)
redis.call("srem", KEYS[2], jobId)
redis.call("srem", KEYS[5], jobId)
redis.call("hdel", KEYS[6], jobId)
redis.call("zrem", KEYS[7], jobId)