--[[
/*!-----------------------------------------------------------
* Original work Copyright (c) 2015 Lewis J Ellis
* Subsequent revisions Copyright (c) 2017 Mixmax, Inc and Lewis J Ellis
* Released under MIT license
* https://github.com/bee-queue/bee-queue/blob/master/LICENSE
*-----------------------------------------------------------*/

https://github.com/bee-queue/bee-queue/blob/1c2fb849708881408fe22c6527e3f62c33a58755/lib/lua/raiseDelayedJobs.lua
]]

--[[
key 1 -> bq:name:delayed
key 2 -> bq:name:waiting
arg 1 -> ms timestamp ("now")
arg 2 -> debounce window (in milliseconds)

returns number of jobs raised and the timestamp of the next job (within the near-term window)
--]]

local now = tonumber(ARGV[1])

-- raise any delayed jobs that are now valid by moving from delayed to waiting
local raising = redis.call("zrangebyscore", KEYS[1], 0, ARGV[1])
local numRaising = #raising

if numRaising > 0 then
  redis.call("rpush", KEYS[2], unpack(raising))
  redis.call("zremrangebyscore", KEYS[1], 0, ARGV[1])
end

local head = redis.call("zrange", KEYS[1], 0, 0, "WITHSCORES")
local nearTerm = -1
if next(head) ~= nil then
  local proximal = redis.call("zrevrangebyscore", KEYS[1], head[2] + tonumber(ARGV[2]), 0, "WITHSCORES", "LIMIT", 0, 1)
  nearTerm = proximal[2]
end

return {numRaising, nearTerm}