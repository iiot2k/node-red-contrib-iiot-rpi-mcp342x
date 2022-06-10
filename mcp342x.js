/**
 * Copyright 2022 Ocean (iiot2k@gmail.com).
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

"use strict";

module.exports = function(RED) {
	const syslib = require("./lib/syslib.js");
	const sysmodule = syslib.LoadModule("rpi_mcp342x");

    RED.nodes.registerType("mcp342x", function(n) {
		var node = this;
		RED.nodes.createNode(node, n);

		node.devtype = parseInt(n.devtype);
		node.devadr = parseInt(n.devadr);
		node.channel = parseInt(n.channel);
		node.mode = parseInt(n.mode);
		node.gain = parseInt(n.gain);
		node.tupdate = parseInt(n.tupdate);
		node.onchange = n.onchange;
		node.rawdata = n.rawdata;
		node.name = n.name || "mcp342" + node.devtype + " @" + (0x68 + parseInt(node.devadr)).toString(16).toUpperCase() + "#" + (parseInt(node.channel) + 1);

		if (sysmodule === undefined)
			syslib.outError(node, "driver error", "driver not load, wrong os or not Raspi");
		else if (!syslib.checkParameter(node))
			syslib.outError(node, "parameter error", "invalid parameter for selected device type");
		else if (!sysmodule.open(node.devadr))
			syslib.outError(node, "open error", "i2c port not open, check i2c");
		else
			node.id_tupdate = setInterval(function () {
				var readval = sysmodule.read(node.devadr, node.channel, node.mode, node.gain, node.rawdata);

				if (readval === undefined)
					syslib.outError(node, "read error", "device not read, check i2c and device");
				else if (!node.onchange || (readval !== node.readval)){
					syslib.outText(node, readval);
					node.send({ payload: readval });
					node.readval = readval;
				}
			}, node.tupdate);
		
		node.on('close', function () {
			clearInterval(node.id_tupdate);
		});
	});
}
