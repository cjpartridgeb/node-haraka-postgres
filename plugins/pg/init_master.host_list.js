exports.hook_init_master = function(next, server) {
	var logerror = this.loginfo;
	server.notes.pg.query('SELECT host FROM hosts', generateHostList);

	function generateHostList(err, result) {
		if(err)	return next(err);

		var host_list = [];
		for(var i=0; i<result.rows.length; i++) {
			host_list.push(result.rows[i].host);
		}

		server.notes.host_list = host_list;
		next();
  }
}
