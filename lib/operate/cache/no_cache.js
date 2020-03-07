const Cache = require('./../cache')

/**
 * Cache module for implementing no caching.
 *
 * This is the default cache module, and allows Operate to run without any
 * caching, simply by forwarding and requests for tapes or ops to the
 * configured adpater module(s) skipping any cache layers.
 *
 * @class NoCache
 * @extends Cache
 */
class NoCache extends Cache {}

module.exports = NoCache