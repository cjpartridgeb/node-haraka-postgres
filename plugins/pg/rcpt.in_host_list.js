exports.hook_rcpt = function(next, connection, params) {
  var rcpt = params[0];
  if (!rcpt.host) return next();

  var domain = rcpt.host.toLowerCase();
  var host_list = connection.server.notes.host_list;
  var host_list_length = host_list.length;
	
  for(var i=0; i<host_list_length; i++) {
    if (host_list[i].toLowerCase() === domain) {
      connection.logdebug(this, "Found host in hostlist, " + domain);
      return next();
    }
  }

  return next(DENY, "We don't deliver mail for this domain");
}
