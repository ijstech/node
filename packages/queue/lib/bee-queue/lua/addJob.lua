--[[
/*!-----------------------------------------------------------
* Original work Copyright (c) 2015 Lewis J Ellis
* Subsequent revisions Copyright (c) 2017 Mixmax, Inc and Lewis J Ellis
* Released under MIT license
* https://github.com/bee-queue/bee-queue/blob/master/LICENSE
*-----------------------------------------------------------*/

https://github.com/bee-queue/bee-queue/blob/1c2fb849708881408fe22c6527e3f62c33a58755/lib/lua/addJob.lua
]]

--[[
key 1 -> bq:name:id (job ID counter)
key 2 -> bq:name:jobs
key 3 -> bq:name:waiting
arg 1 -> job id
arg 2 -> job data
]]

local jobId = ARGV[1]
if jobId == "" then
  jobId = "" .. redis.call("incr", KEYS[1])
  if redis.call("hexists", KEYS[2], jobId) == 1 then return nil end
else
  if redis.call("hexists", KEYS[2], jobId) == 1 then return nil end
end
redis.call("hset", KEYS[2], jobId, ARGV[2])
redis.call("lpush", KEYS[3], jobId)

return jobId